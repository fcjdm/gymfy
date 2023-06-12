import React, { useState, useEffect } from "react";
import { Picker } from '@react-native-picker/picker';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, getDoc, addDoc } from "firebase/firestore";
import { arrayUnion } from "firebase/firestore";
import { auth } from '../firebaseConfig';
import Modal from 'react-native-modal';


export default function ExerciseScreen({navigation}) {
  const [exercises, setExercises] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showUserLists, setShowUserLists] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [listName, setListName] = useState('');

  const fetchExercises = async () => {
    try {
      const db = getFirestore();
      let exercisesQuery = query(collection(db, 'exercises'));

      if (searchTerm !== '') {
        exercisesQuery = query(exercisesQuery, where(searchField, '>=', searchTerm));
      }

      const exercisesSnapshot = await getDocs(exercisesQuery);
      const exercisesData = exercisesSnapshot.docs.map((doc) => doc.data());
      setExercises(exercisesData);
    } catch (error) {
      console.log('Error obtaining exercises', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchExercises();
    });

    return () => {
      unsubscribe();
    };
  }, [navigation]);

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setIsModalVisible(true);
  };

  const handleAddToList = async (listId) => {
    try {
      const db = getFirestore();
      const listRef = doc(db, 'exerciseLists', listId);
  
      const listSnapshot = await getDoc(listRef);
      const listData = listSnapshot.data();
  
      const exerciseExists = listData.exercises.some((exercise) => exercise.name === selectedExercise.name);
      if (exerciseExists) {
        alert('This exercise exists in the list.');
        return;
      }
  
      await updateDoc(listRef, {
        exercises: arrayUnion(selectedExercise)
      });
  
      alert('The exercise has been added.');
      fetchExercises();
      setIsCreatingList(false);
      setIsModalVisible(false);
      setShowUserLists(false); // Cerrar la modal
    } catch (error) {
      console.log('Error adding the exercise', error);
    }
  };

  const handleCreateNewList = async () => {
    setIsCreatingList(true);
  };

  const handleSaveList = async () => {
    try {
      const userEmail = auth.currentUser.email;
  
      const db = getFirestore();
      const newListRef = await addDoc(collection(db, 'exerciseLists'), {
        name: listName,
        userEmail: userEmail,
        exercises: [selectedExercise]
      });
  
      console.log('New list created:', newListRef.id);
  
      alert('List created successfully.');
      setIsCreatingList(false);
      setIsModalVisible(false);
      setShowUserLists(false); // Cerrar la modal
      setListName('');
      fetchExercises();
    } catch (error) {
      console.log('Error creating list', error);
    }
  };

  const handleCancelList = () => {
    setIsCreatingList(false);
    setIsModalVisible(false);
    setListName('');
  };

  const handleSearch = () => {
    fetchExercises();
  };

  const fetchUserLists = async () => {
    try {
      const user = auth.currentUser;
      const db = getFirestore();
      const userListsQuery = query(collection(db, 'exerciseLists'), where('userEmail', '==', user.email));
      const userListsSnapshot = await getDocs(userListsQuery);
      const userListsData = userListsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUserLists(userListsData);
      setShowUserLists(true);
      console.log(userListsData);
    } catch (error) {
      console.log('Error obtaning exercise list', error);
    }
  };

  const handleAddToListClick = () => {
    fetchUserLists();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise list</Text>

      <View style={styles.searchContainer}>
        <Picker
          style={styles.picker}
          selectedValue={searchField}
          onValueChange={(itemValue) => setSearchField(itemValue)}
        >
          <Picker.Item label="Name" value="name" />
          <Picker.Item label="Difficulty" value="difficulty" />
          <Picker.Item label="Muscle" value="muscle" />
          <Picker.Item label="Exercise type" value="type" />
        </Picker>

        <TextInput
          style={styles.searchInput}
          placeholder="Search exercise"
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
        />

        <Button title="Search" onPress={handleSearch} />
      </View>

      <ScrollView>
        {exercises.map((exercise, index) => (
          <TouchableOpacity key={index} onPress={() => handleExerciseClick(exercise)}>
            <View style={styles.exerciseItem}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text>Exercise type: {exercise.type}</Text>
              <Text>Muscle: {exercise.muscle}</Text>
              <Text>Difficulty: {exercise.difficulty}</Text>
            </View>
            {/* Agrega el estilo de borde aquí */}
            <View style={styles.border}></View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal isVisible={isModalVisible} backdropColor={'transparent'} style={{ margin: 0, backgroundColor: 'rgba(0,0,0,.6)' }}>
        <View style={styles.modalContainer}>
          {!showUserLists ? (
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close-outline" size={24} color="black" />
              </TouchableOpacity>

              <ScrollView style={styles.modalScrollView}>
                {selectedExercise && (
                  <View>
                    <Text style={styles.modalTitle}>{selectedExercise.name}</Text>
                    <Text style={styles.modalText}>Difficulty: {selectedExercise.difficulty}</Text>
                    <Text style={styles.modalText}>Muscle: {selectedExercise.muscle}</Text>
                    <Text style={styles.modalText}>Exercise type: {selectedExercise.instructions}</Text>
                    <Text style={styles.modalText}>Description: {selectedExercise.instructions}</Text>
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity style={styles.addButton} onPress={handleAddToListClick}>
                <Text style={styles.buttonText}>Add to list</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowUserLists(false)}>
                <Ionicons name="arrow-back-outline" size={24} color="black" />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>Exercise list</Text>

              {userLists.map((list, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.listItem}
                  onPress={() => handleAddToList(list.id)}
                >
                  <Text>{list.name}</Text>
                  <Text>Ejercicios: {list.exercises.length}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.createNewListButton} onPress={handleCreateNewList}>
                <Text style={styles.buttonText}>Create new list</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      <Modal isVisible={isCreatingList} backdropColor={'transparent'} style={{ margin: 0, backgroundColor: 'rgba(0,0,0,.6)' }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create new list</Text>
            <TextInput
              style={styles.input}
              placeholder="List name"
              value={listName}
              onChangeText={(text) => setListName(text)}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveList}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelList}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  picker: {
    flex: 1,
    marginRight: 8,
  },
  searchInput: {
    flex: 2,
    marginRight: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  exerciseItem: {
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  border: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 8,
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,

  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    borderRadius: 4,
  },
  createNewListButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    marginBottom: 8,
    textAlign: 'justify',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  input: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginLeft: 8,
    borderRadius: 4,
  },
  modalScrollView: {
    maxHeight: '80%', 
  },
});
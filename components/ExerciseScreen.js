import React, { useState, useEffect } from "react";
import { Picker } from '@react-native-picker/picker';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Button, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, getDoc, addDoc } from "firebase/firestore";
import { arrayUnion } from "firebase/firestore";
import { auth } from '../firebaseConfig';
import Modal from 'react-native-modal';
import Checkbox from 'expo-checkbox';


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
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [filterByEmail, setFilterByEmail] = useState(false);
  const [verifiedFilter, setVerifiedFilter] = useState();
  const [defaultFilters, setDefaultFilters] = useState({
    searchField: 'name',
    selectedDifficulty: '',
    searchTerm: '',
    filterByEmail: false,
    verifiedFilter: '',
  });

  const resetFilters = () => {
    setSearchField(defaultFilters.searchField);
    setSelectedDifficulty(defaultFilters.selectedDifficulty);
    setSearchTerm(defaultFilters.searchTerm);
    setFilterByEmail(defaultFilters.filterByEmail);   
    setVerifiedFilter(defaultFilters.verifiedFilter);
  };

  const fetchExercises = async () => {
    try {
      const db = getFirestore();
      let exercisesQuery = query(collection(db, 'exercises'));
  
      if (searchTerm !== '') {
        exercisesQuery = query(exercisesQuery, where(searchField, '>=', searchTerm));
      }
      if (selectedDifficulty !== '') {
        exercisesQuery = query(exercisesQuery, where('difficulty', '==', selectedDifficulty));
      }
  
      // Aplicar filtro por email si está marcado el checkbox
      if (filterByEmail) {
        const user = auth.currentUser;
        exercisesQuery = query(exercisesQuery, where('email', '==', user.email));
      }

      // Aplicar filtro de verified si está seleccionado
      if (verifiedFilter === 'true' || verifiedFilter === 'false') {
        const verifiedBool = verifiedFilter === 'true';
        exercisesQuery = query(exercisesQuery, where('verified', '==', verifiedBool));
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
          <Picker.Item label="Muscle" value="muscle" />
          <Picker.Item label="Exercise type" value="type" />
        </Picker>
        <Picker
          style={styles.picker}
          selectedValue={selectedDifficulty}
          onValueChange={(itemValue) => setSelectedDifficulty(itemValue)}
        >
          <Picker.Item label="Select difficulty" value="" />
          <Picker.Item label="Beginner" value="beginner" />
          <Picker.Item label="Intermediate" value="intermediate" />
          <Picker.Item label="Hard" value="hard" />
        </Picker>

        <TextInput
          style={styles.searchInput}
          placeholder="Search exercise"
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
        />
        <View style={styles.checkboxContainer}>
          <Text style={styles.checkboxLabel}>Filter by Email</Text>
          <Checkbox
            disabled={false}
            value={filterByEmail}
            onValueChange={(value) => setFilterByEmail(value)}
          />
        </View>

        <Picker
          style={styles.picker}
          selectedValue={verifiedFilter}
          onValueChange={(itemValue) => setVerifiedFilter(itemValue)}
        >
          <Picker.Item label="All" />
          <Picker.Item label="Verified" value={true} />
          <Picker.Item label="Unverified" value={false} />
        </Picker>
      </View>
      <View style={styles.filterButton} >
        <Button title="Reset Filters" onPress={resetFilters} />
        <Button title="Search" onPress={handleSearch} />        
      </View>
      <ScrollView>
        {exercises.map((exercise, index) => (
          <TouchableOpacity key={index} onPress={() => handleExerciseClick(exercise)}>
            <View style={styles.exerciseItem}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.verifiedName}>{exercise.verified ? 'verified': ''}</Text>
              <Text>Exercise type: {exercise.type}</Text>
              <Text>Muscle: {exercise.muscle}</Text>
              <Text>Difficulty: {exercise.difficulty}</Text>
            </View> 
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
                    <Text style={styles.modalTextBold}>{selectedExercise.name}</Text>
                    <Text style={styles.modalText}><Text style={styles.modalTextBold}>Difficulty:</Text>{selectedExercise.difficulty}</Text>
                    <Text style={styles.modalText}><Text style={styles.modalTextBold}>Muscle:</Text>{selectedExercise.muscle}</Text>
                    <Text style={styles.modalText}><Text style={styles.modalTextBold}>Exercise type:</Text>{selectedExercise.type}</Text>
                    <Text style={styles.modalText}><Text style={styles.modalTextBold}>Description:</Text>{selectedExercise.instructions}</Text>
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
  verifiedName: {
    fontWeight: 'bold',
    color: '#008000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
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
  picker: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginRight: 8,
  },
  modalTextBold: {
    fontWeight: 'bold',
  },
});
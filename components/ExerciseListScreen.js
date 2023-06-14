import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Button, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import Modal from 'react-native-modal';


export default function ExerciseListScreen({navigation}) {
  const [exerciseLists, setExerciseLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [listName, setListName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedExerciseToDelete, setSelectedExerciseToDelete] = useState(null);
  const [isDeleteConfirmationVisible, setIsDeleteConfirmationVisible] = useState(false);

  useEffect(() => {
    if (isEditModalVisible) {
      setListName(selectedList?.name);
    } else if (isCreateModalVisible) {
      setListName('');
    }
  }, [isEditModalVisible, selectedList]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchExerciseLists();
      fetchUserEmail();
    });

    return () => {
      unsubscribe();
    };
  }, [navigation]);

  const fetchUserEmail = async () => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
    }
  };

  const fetchExerciseLists = async () => {
    try {
      const exerciseListsSnapshot = await getDocs(collection(db, 'exerciseLists'));
      const exerciseListsData = exerciseListsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setExerciseLists(exerciseListsData);
    } catch (error) {
      console.log('Error obtaining lists', error);
    }
  };

  const handleListClick = async (list) => {
    setSelectedList(list);
    setIsModalVisible(true);
  };

  const handleCreateList = async () => {
    try {
      const newList = {
        name: listName,
        exercises: [],
        userEmail: userEmail,
      };
      const docRef = await addDoc(collection(db, 'exerciseLists'), newList);
      const newListData = { id: docRef.id, ...newList };
      setExerciseLists((prevLists) => [...prevLists, newListData]);
      setListName('');
      setIsCreateModalVisible(false);
    } catch (error) {
      console.log('Error creating list', error);
    }
  };

  const handleLongPressList = (list) => {
    setSelectedList(list);
    setIsEditModalVisible(true);
  };

  const handleEditListName = async () => {
    try {
      const listRef = doc(db, 'exerciseLists', selectedList.id);
      await updateDoc(listRef, { name: listName });
      setExerciseLists((prevLists) =>
        prevLists.map((list) => {
          if (list.id === selectedList.id) {
            return { ...list, name: listName };
          }
          return list;
        })
      );
      setIsEditModalVisible(false);
    } catch (error) {
      console.log('Error editing list name', error);
    }
  };

  const handleDeleteList = async () => {
    try {
      const listRef = doc(db, 'exerciseLists', selectedList.id);
      await deleteDoc(listRef);
  
      // Elimina la lista de ejercicios de exerciseLists
      setExerciseLists((prevLists) => prevLists.filter((list) => list.id !== selectedList.id));
  
      setIsEditModalVisible(false);
    } catch (error) {
      console.log('Error deletin exercise list', error);
    }
  };

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleExerciseLongPress = (exercise) => {
    setSelectedExerciseToDelete(exercise);
    setIsDeleteConfirmationVisible(true);
  };

  const handleConfirmExerciseDelete = async () => {
    try {
      const listRef = doc(db, 'exerciseLists', selectedList.id);
      const newList = { ...selectedList };
      newList.exercises = newList.exercises.filter(
        (exercise) => exercise.name !== selectedExerciseToDelete.name
      );
  
      await updateDoc(listRef, { exercises: newList.exercises });
  
      // Actualiza la lista de ejercicios en el estado exerciseLists
      setExerciseLists((prevLists) =>
        prevLists.map((list) => {
          if (list.id === selectedList.id) {
            return newList;
          }
          return list;
        })
      );
  
      // Actualiza la lista de ejercicios en el estado selectedList
      setSelectedList(newList);
  
      setSelectedExerciseToDelete(null);
      setIsDeleteConfirmationVisible(false);
      setSelectedExercise(null);
    } catch (error) {
      console.log('Error deleting exercise', error);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercise list</Text>

      <Button title="Create list" onPress={() => setIsCreateModalVisible(true)} />

      <ScrollView>
        {exerciseLists.map((list) => (
          <TouchableOpacity
            key={list.id}
            onPress={() => handleListClick(list)}
            onLongPress={() => handleLongPressList(list)}
          >
            <View style={styles.listItem}>
              <Text style={styles.listName}>{list.name}</Text>
              <Text>{list.exercises?.length || 0} exercises</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal isVisible={isModalVisible}  backdropColor={'transparent'} style={{ margin: 0, backgroundColor: 'rgba(0,0,0,.6)' }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedList?.name}</Text>
            <ScrollView style={styles.exerciseList}>
              {selectedList && selectedList.exercises && selectedList.exercises.map((exercise, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleExerciseClick(exercise)}
                  onLongPress={() => handleExerciseLongPress(exercise)}
                >
                  <View style={styles.exerciseItem}>
                    <Text style={styles.modalText}>{exercise.name}</Text>
                    <Text style={styles.modalText}>Difficulty: {exercise.difficulty}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {selectedExercise && (
        <Modal isVisible={selectedExercise !== null}  backdropColor={'transparent'} style={{ margin: 0, backgroundColor: 'rgba(0,0,0,.6)' }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedExercise(null)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{selectedExercise.name}</Text>
                    <Text style={styles.modalText}><Text style={styles.modalTextBold}>Difficulty: </Text>{selectedExercise.difficulty}</Text>
                    <Text style={styles.modalText}><Text style={styles.modalTextBold}>Muscle: </Text>{selectedExercise.muscle}</Text>
                    <Text style={styles.modalText}><Text style={styles.modalTextBold}>Exercise type: </Text>{selectedExercise.type}</Text>
                    <Text style={styles.modalText}><Text style={styles.modalTextBold}>Description: </Text>{selectedExercise.instructions}</Text>
            </View>
          </View>
        </Modal>
      )}

      {isCreateModalVisible && (
        <Modal isVisible={isCreateModalVisible} backdropColor={'transparent'} style={{ margin: 0, backgroundColor: 'rgba(0,0,0,.6)' }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create list</Text>
              <TextInput
                style={styles.input}
                placeholder="List name"
                onChangeText={(text) => setListName(text)}
              />
              <Button title="Create" onPress={handleCreateList} />
            </View>
          </View>
        </Modal>
      )}

      {isEditModalVisible && (
        <Modal isVisible={isEditModalVisible} backdropColor={'transparent'} style={{ margin: 0, backgroundColor: 'rgba(0,0,0,.6)' }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit list</Text>
              <TextInput
                style={styles.input}
                placeholder="List name"
                value={listName}
                onChangeText={(text) => setListName(text)}
              />
              <Button title="Save" onPress={handleEditListName} />
              <br/>
              <Button title="Delete" onPress={handleDeleteList} />
            </View>
          </View>
        </Modal>
      )}

      {/* Modal de confirmación para borrar un ejercicio */}
      <Modal isVisible={isDeleteConfirmationVisible} backdropColor={'transparent'} style={{ margin: 0, backgroundColor: 'rgba(0,0,0,.6)' }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.confirmDeleteText}>Are you sure that you want to delete this exercise?</Text>
            <View style={styles.confirmDeleteButtonsContainer}>
              <Pressable style={styles.confirmDeleteButton} onPress={handleConfirmExerciseDelete}>
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmDeleteButton, styles.cancelDeleteButton]}
                onPress={() => setIsDeleteConfirmationVisible(false)}
              >
                <Text style={styles.confirmDeleteButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  listName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  exerciseList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  exerciseItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 10,
  },
  confirmDeleteText: {
    fontSize: 18,
    marginBottom: 20,
  },
  confirmDeleteButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  confirmDeleteButton: {
    backgroundColor: '#ff0000',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  cancelDeleteButton: {
    backgroundColor: '#ccc',
  },
  confirmDeleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTextBold: {
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, TextInput, Button, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, getDocs, query, where, doc, setDoc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { auth} from '../firebaseConfig';

export default function ExerciseListScreen() {
  const [exerciseLists, setExerciseLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [listName, setListName] = useState('');
  const [listExercises, setListExercises] = useState([]);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    fetchExerciseLists();
    fetchUserEmail();
  }, []);

  useEffect(() => {
    if (isEditModalVisible) {
        setListName(selectedList?.name);
    }else if(isCreateModalVisible){
        setListName('');
    }
  }, [isEditModalVisible, selectedList]);

  const fetchUserEmail = async () => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
    }
  };

  const fetchExerciseLists = async () => {
    try {
      const db = getFirestore();
      const exerciseListsSnapshot = await getDocs(collection(db, 'exerciseLists'));
      const exerciseListsData = exerciseListsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setExerciseLists(exerciseListsData);
    } catch (error) {
      console.log('Error al obtener las listas de ejercicios', error);
    }
  };

  const handleListClick = async (list) => {
    setSelectedList(list);
    await fetchListExercises(list.id);
    setIsModalVisible(true);
  };

  const fetchListExercises = async (listId) => {
    try {
      const db = getFirestore();
      const listExercisesQuery = query(collection(db, 'exercises'), where('listId', '==', listId));
      const listExercisesSnapshot = await getDocs(listExercisesQuery);
      const listExercisesData = listExercisesSnapshot.docs.map((doc) => doc.data());
      setListExercises(listExercisesData);
    } catch (error) {
      console.log('Error al obtener los ejercicios de la lista', error);
    }
  };

  const handleCreateList = async () => {
    try {
      const db = getFirestore();
      const newList = {
        name: listName,
        exerciseCount: 0,
        userEmail: userEmail,
      };
      const docRef = await addDoc(collection(db, 'exerciseLists'), newList);
      const newListData = { id: docRef.id, ...newList };
      setExerciseLists((prevLists) => [...prevLists, newListData]);
      setListName('');
      setIsCreateModalVisible(false);
    } catch (error) {
      console.log('Error al crear la lista de ejercicios', error);
    }
  };

  const handleLongPressList = (list) => {
    setSelectedList(list);
    setIsEditModalVisible(true);
  };

  const handleEditListName = async () => {
    try {
      const db = getFirestore();
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
      console.log('Error al editar el nombre de la lista de ejercicios', error);
    }
  };

  const handleDeleteList = async () => {
    try {
      const db = getFirestore();
      const listRef = doc(db, 'exerciseLists', selectedList.id);
      await deleteDoc(listRef);
      setExerciseLists((prevLists) => prevLists.filter((list) => list.id !== selectedList.id));
      setIsEditModalVisible(false);
    } catch (error) {
      console.log('Error al borrar la lista de ejercicios', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Listas de Ejercicios</Text>

      <Button title="Crear Lista" onPress={() => setIsCreateModalVisible(true)} />

      <ScrollView>
        {exerciseLists.map((list) => (
          <TouchableOpacity
            key={list.id}
            onPress={() => handleListClick(list)}
            onLongPress={() => handleLongPressList(list)}
          >
            <View style={styles.listItem}>
              <Text style={styles.listName}>{list.name}</Text>
              <Text>{list.exerciseCount} ejercicios</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedList?.name}</Text>
            <ScrollView style={styles.exerciseList}>
              {listExercises.map((exercise, index) => (
                <TouchableOpacity key={index} onPress={() => console.log(exercise)}>
                  <View style={styles.exerciseItem}>
                    <Text>{exercise.name}</Text>
                    <Text>Duración: {exercise.duration}</Text>
                    <Text>Dificultad: {exercise.difficulty}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isEditModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsEditModalVisible(false)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{"Editar lista"}</Text>
            <TextInput
              style={styles.listNameInput}
              placeholder="Nombre de la lista"
              value={listName}
              onChangeText={(text) => setListName(text)}
            />
            <Button
              title={"Guardar cambios"}
              onPress={handleEditListName}
            />
            {selectedList && (
              <View style={styles.deleteButtonContainer}>
                <Pressable style={styles.deleteButton} onPress={handleDeleteList}>
                  <Text style={styles.deleteButtonText}>Eliminar lista</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <Modal visible={isCreateModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsCreateModalVisible(false)}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{"Crear lista"}</Text>
            <TextInput
              style={styles.listNameInput}
              placeholder="Nombre de la lista"
              value={listName}
              onChangeText={(text) => setListName(text)}
            />
            <Button
              title={"Crear lista"}
              onPress={handleCreateList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  listName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exerciseList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  exerciseItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  listNameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  deleteButtonContainer: {
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
  },
});
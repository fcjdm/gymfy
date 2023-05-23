import React, { useState, useEffect  } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, TextInput, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, getDocs, db } from "firebase/firestore";
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function SuccessScreen() {
  // Ejemplos de datos de ejercicios
  const [exercises, setExercises] = useState([]);

  const [userLists, setUserLists] = useState([
    { id: 1, name: 'Lista 1' },
    { id: 2, name: 'Lista 2' },
    { id: 3, name: 'Lista 3' },
  ]);

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showUserLists, setShowUserLists] = useState(false);

  useEffect(() => {
    // Consulta los ejercicios desde Firebase y actualiza el estado
    const fetchExercises = async () => {
      try {
        const db = getFirestore();
        const exercisesSnapshot = await getDocs(collection(db, 'exercises'));
        const exercisesData = exercisesSnapshot.docs.map((doc) => doc.data());
        setExercises(exercisesData);
      } catch (error) {
        console.log('Error al obtener los ejercicios', error);
      }
    };

    fetchExercises();
  }, []);

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setIsModalVisible(true);
  };

  const handleAddToList = () => {
    // Lógica para agregar el ejercicio a una lista existente o crear una nueva lista
    // Puedes utilizar las funciones de Firebase Firestore para realizar estas operaciones
  };

  const handleCreateNewList = () => {
    // Lógica para crear una nueva lista y agregar el ejercicio a ella
    // Puedes utilizar las funciones de Firebase Firestore para realizar estas operaciones
    console.log('Crear una nueva lista y agregar el ejercicio a ella');
  };

  return (
    <View>
       <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>Lista de Ejercicios</Text>
      <ScrollView>
        {exercises.map((exercise, index) => (
          <TouchableOpacity key={index} onPress={() => handleExerciseClick(exercise)}>
              <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{exercise.name}</Text>
              <Text>Duración: {exercise.duration}</Text>
              <Text>Dificultad: {exercise.difficulty}</Text>
              </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={isModalVisible} transparent={true} animationType="fade">
      <View style={styles.modalContainer}>
        {!showUserLists ? (
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
              <Ionicons name="close-outline" size={24} color="black" />
            </TouchableOpacity>

            {selectedExercise && (
              <View>
                <Text style={styles.modalTitle}>{selectedExercise.name}</Text>
                <Text style={styles.modalText}>Descripción: {selectedExercise.instructions}</Text>
                <Text style={styles.modalText}>Dificultad: {selectedExercise.difficulty}</Text>
                <Text style={styles.modalText}>Duración: {selectedExercise.duration}</Text>

                <Button title="Añadir a una lista" onPress={() => setShowUserLists(true)} />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.goBackButton} onPress={() => setShowUserLists(false)}>
              <Ionicons name="arrow-back-outline" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.addToListText}>Añadir a una lista:</Text>
            <ScrollView style={styles.listContainer}>
              {userLists.map((list) => (
                <TouchableOpacity key={list.id} style={styles.listItem} onPress={() => handleAddToList(list.id)}>
                  <Text>{list.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button title="Crear nueva lista" onPress={handleCreateNewList} />
          </View>
        )}
      </View>
    </Modal>
  </View>
)};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  addToListText: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  closeButton: {
    position: 'absolute',
    top: 2,
    right: 10,
    zIndex: 1,
    padding: 10,
  },
  goBackButton: {
    position: 'absolute',
    top: 2,
    left: 10,
    zIndex: 1,
    padding: 10,
  },
});
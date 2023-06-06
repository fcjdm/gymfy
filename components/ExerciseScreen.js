import React, { useState, useEffect } from "react";
import { Picker } from '@react-native-picker/picker';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, TextInput, Button} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

export default function ExerciseScreen() {
  const [exercises, setExercises] = useState([]);
  const [userLists, setUserLists] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showUserLists, setShowUserLists] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name'); // Campo de búsqueda por defecto

  useEffect(() => {
    fetchExercises();
  }, []);

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
      console.log('Error al obtener los ejercicios', error);
    }
  };

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
    setIsModalVisible(true);
  };

  const handleAddToList = async () =>{
    try {
      const db = getFirestore();
      const exerciseListsSnapshot = await getDocs(collection(db, 'exerciseLists'));
      const exerciseListsData = exerciseListsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUserLists(exerciseListsData);
    } catch (error) {
      console.log('Error al obtener las listas de ejercicios', error);
    }
  };

  const handleCreateNewList = () => {
    // Lógica para crear una nueva lista y agregar el ejercicio a ella
    // Puedes utilizar las funciones de Firebase Firestore para realizar estas operaciones
    console.log('Crear una nueva lista y agregar el ejercicio a ella');
  };

  const handleSearch = () => {
    fetchExercises();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lista de Ejercicios</Text>

      <View style={styles.searchContainer}>
        <Picker
          style={styles.picker}
          selectedValue={searchField}
          onValueChange={(itemValue) => setSearchField(itemValue)}
        >
          <Picker.Item label="Nombre" value="name" />
          <Picker.Item label="Dificultad" value="difficulty" />
          <Picker.Item label="Duración" value="duration" />
          <Picker.Item label="Tipo de ejercicio" value="type" />
        </Picker>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ejercicios..."
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
        />

        <Button title="Buscar" onPress={handleSearch} />
      </View>

      <ScrollView>
        {exercises.map((exercise, index) => (
          <TouchableOpacity key={index} onPress={() => handleExerciseClick(exercise)}>
            <View style={styles.exerciseItem}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
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
                  <Text style={styles.modalText}>Descripción: {selectedExercise.description}</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  picker: {
    flex: 1,
    marginRight: 10,
  },
  searchInput: {
    flex: 2,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingLeft: 10,
  },
  exerciseItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
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
  listContainer: {
    maxHeight: 200,
    marginBottom: 10,
  },
  listItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 5,
    borderRadius: 5,
  },
});
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Picker, Alert } from 'react-native';
import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { auth } from '../firebaseConfig';

export default function ExerciseListScreen({navigation}) {
  const [exerciseData, setExerciseData] = useState({
    name: '',
    difficulty: 'beginner',
    muscle: '',
    type: '',
    instructions: '',
    email: auth.currentUser.email,
    verified: false,
  });

  const handleChange = (name, value) => {
    setExerciseData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const db = getFirestore();
      const exerciseRef = collection(db, 'exercises');
      const exerciseQuery = query(exerciseRef, where('name', '==', exerciseData.name));
      const existingExercises = await getDocs(exerciseQuery);
  
      if (!existingExercises.empty) {
        window.alert('The exercise already exists');
        return;
      }
  
      await addDoc(exerciseRef, exerciseData);
      navigation.navigate('Home');
    } catch (error) {
      console.log('Error adding exercise', error);
    }
  };
  

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Exercise</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Exercise name:</Text>
        <TextInput
          style={styles.input}
          onChangeText={(value) => handleChange('name', value)}
          value={exerciseData.name}
          required
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Difficulty:</Text>
        <Picker
          style={styles.input}
          selectedValue={exerciseData.difficulty}
          onValueChange={(value) => handleChange('difficulty', value)}
        >
          <Picker.Item label="Beginner" value="beginner" />
          <Picker.Item label="Intermediate" value="intermediate" />
          <Picker.Item label="Difficult" value="difficult" />
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Muscle:</Text>
        <TextInput
          style={styles.input}
          onChangeText={(value) => handleChange('muscle', value)}
          value={exerciseData.muscle}
          required
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Exercise type:</Text>
        <TextInput
          style={styles.input}
          onChangeText={(value) => handleChange('type', value)}
          value={exerciseData.type}
          required
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Instructions:</Text>
        <TextInput
          style={styles.textArea}
          multiline
          onChangeText={(value) => handleChange('instructions', value)}
          value={exerciseData.instructions}
          required
        />
      </View>

      <Button title="Add exercise" onPress={handleFormSubmit} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    textAlignVertical: 'top',
  },
});
import React, { useState, useEffect  } from "react";
import { StyleSheet, View, Text, TextInput, Button, KeyboardAvoidingView, Platform } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import{ collection, addDoc} from "firebase/firestore";

export default function LoginScreen({navigation}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState('');

  const handleLogin = () => {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      setMessage('Login succesfully');
      const user = userCredential.user;
      console.log(user);
      navigation.navigate('Home');
    })
    .catch((error) => setMessage(error.message));
  };

  const handleRegister = () => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      setMessage('Register succesfully!');
      navigation.navigate('Home');
  })
    .catch((error) => setMessage(error.message));
  };
 //Insercion de datos--------------------------------------------------
 /* useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.api-ninjas.com/v1/exercises', {
          headers: {
            'X-Api-Key': 'wMCu8kvndCMvHusxXu5Mtg==TKQ47CEc5fLxL46j',
          },
        });
        const data = await response.json();

        const exercisesCollectionRef = collection(db, 'exercises');
        for (let exercise of data) {
          await addDoc(exercisesCollectionRef, exercise);
        }

        console.log('Datos importados correctamente en Firestore.');
      } catch (error) {
        console.error('Error al importar los datos:', error);
      }
    };

    fetchData();
  }, []);*/

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>LOG IN</Text>
        {message ? <Text style={styles.error}>{message}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          onChangeText={(email) => setEmail(email)}
          value={email}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          onChangeText={(password) => setPassword(password)}
          value={password}
        />
        <View style={styles.buttonContainer}>
          <Button title="Log in" onPress={handleLogin} />
          <Button title="Sign in" onPress={handleRegister} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "gray",
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
});
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, KeyboardAvoidingView, Platform } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
        navigation.navigate('Home');
      })
      .catch((error) => setMessage(error.message));
  };

  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        navigation.navigate('Home');
      })
      .catch((error) => setMessage(error.message));
  };

  const handleResetPassword = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage('Reset password email sent successfully');
      })
      .catch((error) => setMessage(error.message));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
        <View style={styles.buttonContainer}>
          <Button title="Reset Password" onPress={handleResetPassword} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
});
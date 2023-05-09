import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, Button, KeyboardAvoidingView } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

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
      navigation.navigate('SuccessScreen');
    })
    .catch((error) => setMessage(error.message));
  };

  const handleRegister = () => {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      setMessage('Register succesfully!');
      const user = userCredential.user;
      console.log(user);
      navigation.navigate('SuccessScreen');
    })
    .catch((error) => setMessage(error.message));
  };

  return (
    <KeyboardAvoidingView>
      <View style={styles.container}>
        <Text style={styles.title}>Iniciar sesión</Text>
        {message ? (
          <Text style={styles.error}>{message}</Text>
        ) : null}
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          autoCapitalize="none"
          onChangeText={email => setEmail(email)}
          value={email}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          onChangeText={password => setPassword(password)}
          value={password}
        />
      </View>
      <View>
        <Button 
          title="Iniciar sesión" 
          onPress={handleLogin} 
        />
        <Button
          title="Registrarse"
          onPress={handleRegister}
        />
      </View>     
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
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
  },
});
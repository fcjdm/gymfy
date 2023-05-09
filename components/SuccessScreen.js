import React, { useState } from "react";
import { StyleSheet, View, Text} from 'react-native';
import { Button } from "react-native-elements/dist/buttons/Button";
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export default function SuccessScreen() {
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Logueo exitoso</Text>
      <Button title="Cerrar sesion" onPress={logout}>Cerrar sesion</Button>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
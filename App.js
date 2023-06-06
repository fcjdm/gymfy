import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import LoginScreen from './components/LoginScreen';
import ExerciseScreen from './components/ExerciseScreen';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Importar el objeto `auth`
import ExerciseListScreen from './components/ExerciseListScreen';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const navigation = useNavigation();

  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar el estado de autenticación
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthenticated(!!user); // Actualizar el estado según si el usuario está autenticado o no
    });

    return () => {
      unsubscribe(); // Cancelar la suscripción al cambio de estado de autenticación
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Utilizar el objeto `auth` importado
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      {authenticated && (
        <DrawerItem
          label="Sign out"
          onPress={handleSignOut}
          labelStyle={styles.signOutLabel}
          style={styles.signOutButton}
        />
        
      )}
    </DrawerContentScrollView>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator drawerContent={CustomDrawerContent}>
        <Drawer.Screen name="Login" component={LoginScreen} options={{ headerShown: false, drawerLabel: () => null }} />
        <Drawer.Screen name="Home" component={ExerciseScreen} />
        <Drawer.Screen name="My lists" component={ExerciseListScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  signOutLabel: {
    color: 'red',
  },
  signOutButton: {
    borderRadius: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
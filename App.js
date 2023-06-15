import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, BackHandler, Alert } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import LoginScreen from './components/LoginScreen';
import ExerciseScreen from './components/ExerciseScreen';
import { signOut } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import ExerciseListScreen from './components/ExerciseListScreen';
import AddNewExerciseScreen from './components/AddNewExerciseScreen';
import ProfileScreen from './components/ProfileScreen';
import { doc, getDoc } from 'firebase/firestore';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props) => {
  const navigation = useNavigation();
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
      <DrawerItem
        label={() => (
          <View style={styles.imageContainer}>
            {props.image ? (
              <Image source={{ uri: props.image }} style={styles.profileImage} />
            ) : (
              <View style={styles.emptyProfileImage}>
                <Text style={styles.emptyProfileImageText}>No hay foto de perfil</Text>
              </View>
            )}
          </View>
        )}
        onPress={() => props.navigation.navigate('Profile')}
      />
      <DrawerItem label="Home" onPress={() => props.navigation.navigate('Home')} />
      <DrawerItem label="My lists" onPress={() => props.navigation.navigate('My lists')} />
      <DrawerItem label="New Exercise" onPress={() => props.navigation.navigate('New Exercise')} />
      {props.authenticated && (
        <DrawerItem
          label={() => <Text style={styles.signOutLabelText}>Sign out</Text>}
          onPress={handleSignOut}
          style={styles.signOutButton}
        />
      )}
    </DrawerContentScrollView>
  );
};

export default function App() {
  const user = auth.currentUser;
  const [authenticated, setAuthenticated] = useState(false);
  const [image, setImage] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    // Verificar el estado de autenticación
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthenticated(!!user); // Actualizar el estado según si el usuario está autenticado o no
      setShowDrawer(!!user);
    });

    return () => {
      unsubscribe(); // Cancelar la suscripción al cambio de estado de autenticación
    };
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleSignOut();
    });

    return () => {
      backHandler.remove();
    };
  }, [authenticated]);


  useEffect(() => {
    fetchUserProfile();
  }, [authenticated]);

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Utilizar el objeto `auth` importado
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        const docSnapshot = await getDoc(userDoc);
        console.log(docSnapshot);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();

          if (userData.photoURL) {
            setImage(userData.photoURL);
          }
        }
      }
    } catch (error) {
      console.log('Error al obtener el perfil de usuario', error);
    }
  };

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Login"
        drawerContent={(props) =>
          showDrawer ? <CustomDrawerContent {...props} image={image} authenticated={authenticated} navigation={props.navigation} /> : null
        }
      >
        <>
          <Drawer.Screen name="Login" component={LoginScreen} options={{ headerShown: false, drawerLabel: () => null }} />
          <Drawer.Screen name="Profile" component={ProfileScreen} />
          <Drawer.Screen name="Home" component={ExerciseScreen} />
          <Drawer.Screen name="My lists" component={ExerciseListScreen} />
          <Drawer.Screen name="New Exercise" component={AddNewExerciseScreen} />
        </>
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  signOutLabelText: {
    color: 'red',
  },
  signOutButton: {
    borderRadius: 10,
  },
  imageContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  emptyProfileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'lightgray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyProfileImageText: {
    color: 'white',
  },
});
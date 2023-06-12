import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Button, Alert, Platform } from 'react-native';
import { doc, setDoc, getDoc, collection } from 'firebase/firestore';
import { sendPasswordResetEmail, deleteUser, updateProfile } from 'firebase/auth';
import { auth, storage, db } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [image, setImage] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        const docSnapshot = await getDoc(userDoc);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setUserProfile(userData);
          setName(userData.name || '');
          setDateOfBirth(userData.dateOfBirth || '');
          setNationality(userData.nationality || '');
          if (userData.photoURL) {
            setImage(userData.photoURL);
          }
        }
      }
    } catch (error) {
      console.log('Error al obtener el perfil de usuario', error);
    }
  };

  const handleEditProfile = async () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        await setDoc(userDoc, { name, dateOfBirth, nationality}, { merge: true });
        setIsEditing(false);
        Alert.alert('Perfil actualizado correctamente');
      }
    } catch (error) {
      console.log('Error al guardar el perfil de usuario', error);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (user) {
        await sendPasswordResetEmail(auth, user.email);
        alert('Se ha enviado un correo electrónico para restablecer la contraseña');
      }
    } catch (error) {
      console.log('Error al restablecer la contraseña', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (user) {
        await deleteUser(user);
        navigation.navigate('LoginScreen');
        alert('Cuenta eliminada correctamente');
      }
    } catch (error) {
      console.log('Error al eliminar la cuenta', error);
    }
  };

  const handleChooseProfileImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.cancelled) {
        const { uri } = result;
        setImage(uri);
        uploadProfileImage(uri);
      }
    } catch (error) {
      console.log('Error al elegir la imagen de perfil', error);
    }
  };

  const uploadProfileImage = async (uri) => {
    try {
      const filename = uri.substring(uri.lastIndexOf('/') + 1);
      const uploadUri = Platform.OS === 'web' ? uri.replace('file://', '') : uri;
  
      const storageRef = ref(storage, `profileImages/${user.uid}/${filename}`);
      const response = await fetch(uploadUri);
      const blob = await response.blob();
  
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setUserProfile((prevProfile) => ({ ...prevProfile, photoURL: downloadURL }));
      const userDoc = doc(db, 'users', user.uid);
      await setDoc(userDoc, { photoURL: downloadURL}, { merge: true });
    } catch (error) {
      console.log('Error al cargar la imagen de perfil', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleChooseProfileImage}>
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <View style={styles.emptyProfileImage}>
              <Text style={styles.emptyProfileImageText}>No hay foto de perfil</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={(text) => setName(text)}
        editable={isEditing}
      />
      <TextInput
        style={styles.input}
        placeholder="Fecha de Nacimiento"
        value={dateOfBirth}
        onChangeText={(text) => setDateOfBirth(text)}
        editable={isEditing}
      />
      <TextInput
        style={styles.input}
        placeholder="Nacionalidad"
        value={nationality}
        onChangeText={(text) => setNationality(text)}
        editable={isEditing}
      />
      {!isEditing ? (
        <Button title="Editar Perfil" onPress={handleEditProfile} />
      ) : (
        <Button title="Guardar Perfil" onPress={handleSaveProfile} />
      )}
      <Button title="Restablecer Contraseña" onPress={handleResetPassword} />
      <Button title="Eliminar Cuenta" onPress={handleDeleteAccount} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ccc',
    overflow: 'hidden',
    marginBottom: 20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  emptyProfileImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyProfileImageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    padding: 10,
  },
});
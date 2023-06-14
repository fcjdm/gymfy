import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Button,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import {  doc, setDoc, getDoc, query, where, getDocs, deleteDoc, collection } from 'firebase/firestore';
import { sendPasswordResetEmail, deleteUser, updateProfile } from 'firebase/auth';
import { auth, storage, db } from '../firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Picker } from '@react-native-picker/picker';

export default function ProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [image, setImage] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');

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

  const deleteExerciseLists = async (email) => {
    try {
      const exerciseListsQuery = query(collection(db, 'exerciseLists'), where('userEmail', '==', email));
      const exerciseListsSnapshot = await getDocs(exerciseListsQuery);
  
      exerciseListsSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
  
      console.log('Listas de ejercicios eliminadas correctamente');
    } catch (error) {
      console.log('Error al eliminar las listas de ejercicios', error);
    }
  };

  const handleEditProfile = async () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        await setDoc(userDoc, { name, dateOfBirth, nationality }, { merge: true });
        setIsEditing(false);
        Alert.alert('Perfil actualizado correctamente');
      }
    } catch (error) {
      console.log('Error al guardar el perfil de usuario', error);
    }
  };

  const handleResetPassword = async () => {
    setConfirmModalVisible(true);
    setActionType('resetPassword');
  };

  const handleDeleteAccount = async () => {
    setConfirmModalVisible(true);
    setActionType('deleteAccount');
  };

  const confirmAction = async () => {
    try {
      if (user) {
        if (actionType === 'resetPassword') {
          await sendPasswordResetEmail(auth, user.email);
          Alert.alert('Se ha enviado un correo electrónico para restablecer la contraseña');
        } else if (actionType === 'deleteAccount') {
          await deleteExerciseLists(user.email);
          await deleteUser(user);
          navigation.navigate('Login');
          Alert.alert('Cuenta eliminada correctamente');
        }
      }
    } catch (error) {
      console.log('Error al realizar la acción', error);
    }
    setConfirmModalVisible(false);
  };

  const cancelAction = () => {
    setConfirmModalVisible(false);
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
      await setDoc(userDoc, { photoURL: downloadURL }, { merge: true });
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
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={(text) => setName(text)}
          editable={isEditing}
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Birthday</Text>
        <TextInput
          style={styles.input}
          placeholder="Birthday"
          value={dateOfBirth}
          onChangeText={(text) => setDateOfBirth(text)}
          editable={isEditing}
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Nationality</Text>
        <Picker
          selectedValue={nationality}
          onValueChange={(itemValue) => setNationality(itemValue)}
          enabled={isEditing}
        >
          <Picker.Item label="Select your nationality" value="" />
          <Picker.Item label="Spain" value="Spain" />
          <Picker.Item label="France" value="France" />
          <Picker.Item label="Germany" value="Germany" />
          {/* Agrega más elementos según las nacionalidades que desees */}
        </Picker>
      </View>
      {!isEditing ? (
        <Button title="Edit profile" onPress={handleEditProfile} color="green" />
      ) : (
        <Button title="Save profile" onPress={handleSaveProfile} color="green" />
      )}
      <View style={styles.buttonsContainer}>
        <Button
          title="Reset password"
          onPress={handleResetPassword}
          color="blue"
          style={styles.resetButton}
        />
        <Button
          title="Delete account"
          onPress={handleDeleteAccount}
          color="red"
          style={styles.deleteButton}
        />
      </View>
      <Modal visible={confirmModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {actionType === 'resetPassword'
                ? 'Are you sure that you want to reset your password?. It will send a message to your account email'
                : 'Are you sure that you want to delete your account?'}
            </Text>
            <View style={styles.modalButtonsContainer}>
              <Button title="Confirm" onPress={confirmAction} color="#dc3545" />
              <Button title="Cancel" onPress={cancelAction} />
            </View>
          </View>
        </View>
      </Modal>
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
    overflow: 'hidden',
    marginBottom: 20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  emptyProfileImage: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  emptyProfileImageText: {
    fontSize: 16,
    color: '#666',
  },
  input: {
    width: '80%',
    height: 40,
    marginBottom: 20,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  infoContainer: {
    width: '80%',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
    width: '80%',
  },
  resetButton: {
    backgroundColor: 'blue',
  },
  deleteButton: {
    backgroundColor: 'red',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderRadius: 10,
    width: '80%',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
  },
});
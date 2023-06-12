import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Button, Alert, Modal } from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { sendPasswordResetEmail, deleteUser, updateProfile } from 'firebase/auth';
import { auth, storage, db } from '../firebaseConfig';
import * as ImagePicker from 'react-native-image-picker';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProfileScreen({ navigation }) {
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
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
        await updateDoc(userDoc, { name, dateOfBirth, nationality });
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
        setShowResetPasswordModal(false);
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
        setShowDeleteAccountModal(false);
        navigation.navigate('LoginScreen');
        alert('Cuenta eliminada correctamente');
      }
    } catch (error) {
      console.log('Error al eliminar la cuenta', error);
    }
  };

  const handleChooseProfileImage = async () => {
    const options = {
      mediaType: 'photo',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('Selección de imagen cancelada');
      } else if (response.error) {
        console.log('Error al seleccionar la imagen:', response.error);
      } else {
        setProfileImage(response.uri);
        uploadProfileImage(response.uri);
      }
    });
  };

  const uploadProfileImage = async (imageUri) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
  
      const imageRef = ref(storage, `profileImages/${user.uid}`);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
  
      // Actualizar la propiedad 'photoURL' en el perfil del usuario en Auth
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
  
      // Actualizar la propiedad 'photoURL' en el documento del usuario en Firestore
      const userDoc = doc(db, 'users', user.uid);
      await setDoc(userDoc, { photoURL: downloadURL });
  
      // Actualizar la propiedad 'photoURL' en el estado userProfile
      setUserProfile((prevProfile) => ({ ...prevProfile, photoURL: downloadURL }));
    } catch (error) {
      console.log('Error al cargar la imagen de perfil', error);
    }
  };

  const renderProfileImage = () => {
    if (profileImage) {
      return <Image source={{ uri: profileImage }} style={styles.profileImage} />;
    } else if (userProfile?.photoURL) {
      return <Image source={{ uri: userProfile.photoURL }} style={styles.profileImage} />;
    } else {
      return <Text>No hay imagen de perfil</Text>;
    }
  };

  const renderProfileFields = () => {
    if (isEditing) {
      return (
        <>
          <TextInput
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
            style={styles.inputField}
          />
          <TextInput
            placeholder="Fecha de Nacimiento"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            style={styles.inputField}
          />
          <TextInput
            placeholder="Nacionalidad"
            value={nationality}
            onChangeText={setNationality}
            style={styles.inputField}
          />
        </>
      );
    } else {
      return (
        <>
          <Text>Nombre: {userProfile?.name || 'Sin nombre'}</Text>
          <Text>Fecha de Nacimiento: {userProfile?.dateOfBirth || 'Sin fecha de nacimiento'}</Text>
          <Text>Nacionalidad: {userProfile?.nationality || 'Sin nacionalidad'}</Text>
        </>
      );
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleChooseProfileImage}>
        {renderProfileImage()}
      </TouchableOpacity>
      {renderProfileFields()}
      {isEditing ? (
        <Button title="Guardar" onPress={handleSaveProfile} />
      ) : (
        <Button title="Editar" onPress={handleEditProfile} />
      )}
      <Button title="Restablecer Contraseña" onPress={() => setShowResetPasswordModal(true)} />
      <Button title="Borrar Cuenta" onPress={() => setShowDeleteAccountModal(true)} color="red" />

      {/* Reset Password Modal */}
      <Modal visible={showResetPasswordModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Restablecer Contraseña</Text>
            <Text style={styles.modalMessage}>¿Estás seguro de que deseas restablecer tu contraseña?</Text>
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setShowResetPasswordModal(false)} />
              <Button title="Aceptar" onPress={handleResetPassword} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={showDeleteAccountModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Borrar Cuenta</Text>
            <Text style={styles.modalMessage}>¿Estás seguro de que deseas borrar tu cuenta?</Text>
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setShowDeleteAccountModal(false)} />
              <Button title="Aceptar" onPress={handleDeleteAccount} />
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
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  inputField: {
    width: '80%',
    height: 40,
    marginBottom: 10,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
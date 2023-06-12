import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';



const firebaseConfig = {
    apiKey: "AIzaSyDtjlSKCakftogDK0XVeOwv0e4iI2R4Jh8",
    authDomain: "gymfy-e76e2.firebaseapp.com",
    projectId: "gymfy-e76e2",
    storageBucket: "gymfy-e76e2.appspot.com",
    messagingSenderId: "1098437118781",
    appId: "1:1098437118781:web:2c2ce0413c17adfbe81354"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
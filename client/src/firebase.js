// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "mern-attendance.firebaseapp.com",
    projectId: "mern-attendance",
    storageBucket: "mern-attendance.appspot.com",
    messagingSenderId: "829507992403",
    appId: "1:829507992403:web:bf9e4d05d57d540cb47fa6"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
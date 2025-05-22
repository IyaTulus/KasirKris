// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAj5b8ly-GLaf8jWEezYo7ASP1KURkodIo",
  authDomain: "kasir-kris-8de4b.firebaseapp.com",
  databaseURL: "https://kasir-kris-8de4b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kasir-kris-8de4b",
  storageBucket: "kasir-kris-8de4b.firebasestorage.app",
  messagingSenderId: "503991052332",
  appId: "1:503991052332:web:fbcff64caee6f4d0434989",
  measurementId: "G-H7PMWD7HEX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { app, database };
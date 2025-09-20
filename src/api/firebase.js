// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD40Oovb_G8pQnI5BQXKDC6X6c56VHpXQc", // REPLACE THIS WITH THE EXACT KEY FROM YOUR CONSOLE
  authDomain: "campus-lost-found-e7b4e.firebaseapp.com",
  projectId: "campus-lost-found-e7b4e",
  storageBucket: "campus-lost-found-e7b4e.firebasestorage.app",
  messagingSenderId: "71346776946",
  appId: "1:71346776946:web:759f2b8fd8ebd8f7610beb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Firebase services for use in other parts of our app
export const auth = getAuth(app);
export const db = getFirestore(app);
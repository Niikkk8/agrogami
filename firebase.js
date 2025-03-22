// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBk5IZgyee9VykuB1Hy6nkv-enx9VmsDZE",
  authDomain: "agrogrami-c3225.firebaseapp.com",
  projectId: "agrogrami-c3225",
  storageBucket: "agrogrami-c3225.firebasestorage.app",
  messagingSenderId: "565011809212",
  appId: "1:565011809212:web:badaf74fcfeefc8d7f61b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app)
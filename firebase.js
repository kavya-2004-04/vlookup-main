// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBiYs7FoNkZoCGISsbpUW_VTHJ3dLssheo",
  authDomain: "vlookup-eb2ae.firebaseapp.com",
  projectId: "vlookup-eb2ae",
  storageBucket: "vlookup-eb2ae.firebasestorage.app",
  messagingSenderId: "41494813156",
  appId: "1:41494813156:web:460d268844cc438b9f4ff1",
  measurementId: "G-E6PY3SFDS7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
const db = getFirestore(app);

export { db };
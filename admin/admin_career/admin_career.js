  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
  import { getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyBiYs7FoNkZoCGISsbpUW_VTHJ3dLssheo",
    authDomain: "vlookup-eb2ae.firebaseapp.com",
    projectId: "vlookup-eb2ae",
    storageBucket: "vlookup-eb2ae.appspot.com",
    messagingSenderId: "41494813156",
    appId: "1:41494813156:web:6b98657c5c1469769f4ff1",
    measurementId: "G-1PBVX0QKRE"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  window.db = db;
  window.fs = { collection, getDocs, addDoc, deleteDoc, updateDoc, doc };

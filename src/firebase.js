// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Optional: Firestore
import { getAuth } from "firebase/auth"; // Optional: Authentication
import { getStorage } from "firebase/storage"; // Optional: Storage

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzWcOPasd5_KEcRodDRVtJA_wUn_-35N8",
    authDomain: "livio-e4af5.firebaseapp.com",
    projectId: "livio-e4af5",
    storageBucket: "livio-e4af5.appspot.com",
    messagingSenderId: "641180735040",
    appId: "1:641180735040:web:b95b1bcf4f53f4d519f1a5"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

// Export services you need
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };

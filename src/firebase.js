import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzWcOPasd5_KEcRodDRVtJA_wUn_-35N8",
  authDomain: "livio-e4af5.firebaseapp.com",
  projectId: "livio-e4af5",
  storageBucket: "livio-e4af5.appspot.com",
  messagingSenderId: "641180735040",
  appId: "1:641180735040:web:b95b1bcf4f53f4d519f1a5",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services you need
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };


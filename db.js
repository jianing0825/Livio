import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";




// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzWcOPasd5_KEcRodDRVtJA_wUn_-35N8",
    authDomain: "livio-e4af5.firebaseapp.com",
    databaseURL: "https://livio-e4af5-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "livio-e4af5",
    storageBucket: "livio-e4af5.appspot.com",
    messagingSenderId: "641180735040",
    appId: "1:641180735040:web:b95b1bcf4f53f4d519f1a5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore();
// const auth = getAuth(app);

// // Create data with Auto ID
// async function createAutoID() {
//     const docRef = await addDoc(collection(db, "users"), {
//         first: "Ada",
//         last: "Lovelace",
//         born: 1815
//     })
//         .then(() => {
//             alert("data added.");
//         })
//         .catch((error) => {
//             alert("data not added. " + error);
//         });
//     console.log("Document ID: " + docRef.id);
// }

// // Create data with Custom *UNIQUE* ID
// async function createCustomID() {
//     await setDoc(doc(db, "users", "uniqueID1"), {
//         first: "John",
//         last: "Lovelace",
//         born: 1915
//     })
//         .then(() => {
//             alert("data added.");
//         })
//         .catch((error) => {
//             alert("data not added. " + error);
//         })
// }

// // Read data
// async function read() {
//     const querySnapshot = await getDoc(doc(db, "users", "uniqueID1"));
//     console.log(querySnapshot._document.data.value.mapValue.fields);
// }

// // Update
// async function update() {
//     await updateDoc(doc(db, "users", "uniqueID1"), {
//         first: "Joshua",
//         last: "Lovelace",
//         born: 2002
//     })
//         .then(() => {
//             alert("data updated.");
//         })
//         .catch((error) => {
//             alert("data not updated. " + error);
//         })
// }

// // Delete
// async function delData() {
//     var ref = doc(db, "users", "uniqueID1");
//     const querySnapshot = await getDoc(ref);
//     if (!querySnapshot.exists()) {
//         alert("Document does not exist");
//         return;
//     }
//     await deleteDoc(ref)
//     .then(()=>{
//         alert("data deleted.");
//     })
//     .catch((error)=>{
//         alert("data not deleted. " + error);
//     })
// }

// Export the functions and db instance
// export { createAutoID, createCustomID, read, update, delData, db };
export { db };
// userStorage.js


import { collection, addDoc, getDoc, doc, setDoc, updateDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";



// Function to find next available ID
async function findNextAvailableId(db) {
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("id", "asc"));
        const snapshot = await getDocs(q);

        let usedIds = new Set();
        let maxId = 0;

        snapshot.forEach(doc => {
            const userId = doc.data().id;
            usedIds.add(userId);
            maxId = Math.max(maxId, userId);
        });

        for (let i = 1; i <= maxId + 1; i++) {
            if (!usedIds.has(i)) {
                return i;
            }
        }

        return maxId + 1;
    } catch (error) {
        console.error("Error finding next available ID:", error);
        throw error;
    }
}

export async function storeUserData(db, userData, isGoogleSignIn = false) {
    try {
        // Create authentication user if it's not a Google sign-in
        if (!isGoogleSignIn && userData.email && userData.password) {
            try {
                await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            } catch (error) {
                console.error("Error creating authentication user:", error);
                throw error;
            }
        }

        // Get next available ID
        const userId = await findNextAvailableId(db);
      


        // Prepare user data 
        const normalizedData = {
            id: userId,
            email: userData.email || '',
            password: userData.password || '',
            firstName: userData.firstName || userData.first || userData.firstname || '',
            lastName: userData.lastName || '',
            age: userData.age || '',
            bio: userData.bio || '',
            budget: userData.budget || '',
            gender: userData.gender || '',
            roommateGender: userData.roommateGender || '',
            moveInDate: userData.moveInDate || '',
            interests: userData.interests || [],
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),

        };


        // Store in Firestore
        const docRef = await addDoc(collection(db, "users"), normalizedData);
        console.log("User document written with ID:", docRef.id, "User number:", userId);
        return docRef.id;
    } catch (error) {
        console.error("Error adding user document:", error);
        throw error;
    }
}


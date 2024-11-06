const { db } = require("../config/firebase");
const { doc, getDoc } = require("firebase/firestore");
const getUserByID = async id => {
  try {
    const userDocRef = doc(db, "users", id); // Reference to the user document
    const userSnapshot = await getDoc(userDocRef); // Get the document

    if (userSnapshot.exists()) {
      return userSnapshot.data(); // User data
    } else {
      console.log("No user found with the given ID");
      return null;
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getUserByID };

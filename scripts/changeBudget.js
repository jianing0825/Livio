import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import {
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from "../src/firebase.js";

const app = createApp({
  data: () => ({
    budget: 0,
    loading: true,
    userId: localStorage.getItem('userId') ,
    user: null,
    roomBooked:false,

  }),
  methods: {
    async handleSubmit() {
      this.loading = true;
      const userRef = doc(db, "users", this.userId);
      await updateDoc(userRef, {
        budget: this.budget,
      });
      this.loading = false;
      alert("Budget updated successfully!");
      window.location.href = "/allexpenses.html";
    },
    async getUserById(userId) {
      const userDoc = await getDoc(doc(db, "users", userId));
      this.user = userDoc.data();
      this.budget = this.user.budget;
      this.loading = false;
    },
    async validateBookedRomm(){
      const userId =  localStorage.getItem("userId")
        const applicationsQuerySnapshot = await getDocs(query( collection(db, "rentalApplications"), where("roommates", "array-contains", userId) ));
        console.log(applicationsQuerySnapshot.docs);
        this.roomBooked = applicationsQuerySnapshot.docs.length>0;
        
      }
  },
  mounted() {
    this.getUserById(this.userId);
    this.validateBookedRomm()

  },
});

app.mount("#app");

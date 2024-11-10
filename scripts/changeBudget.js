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
  },
  mounted() {
    this.getUserById(this.userId);
  },
});

app.mount("#app");

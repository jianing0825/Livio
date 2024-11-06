import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from "../src/firebase.js";

const app = createApp({
  data() {
    return {
      pendingPayments: [],
      userId: "fFAn1qIMMeEAc6G4R9nf",
      loading: true,
    };
  },
  methods: {
    async fetchExpensesByParticipantId(participantId) {
      // Query documents where paymentStatuses contains the given participant ID
      const q = query(
        collection(db, "expenses"),
        where("participants", "array-contains", participantId)
      );
      const querySnapshot = await getDocs(q);
      this.pendingPayments = querySnapshot.docs
        .map(doc => ({ id: doc.id, data: doc.data() }))
        .filter(expense => {
          // Filter documents where paymentStatuses for the participant is "pending"
          return expense.data.paymentStatuses[participantId] === "pending";
        });
      console.log(this.pendingPayments);
      this.loading = false;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },

    async payNow(payment) {
      try {
        const response = await fetch(`http://localhost:5000/api/payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            expenseId: payment.id,
            paymentDue: payment.data.expenseSplit[this.userId],
            userId: this.userId,
          }),
        });

        const responseData = await response.json();
        window.location = responseData.session.url;
      } catch (error) {
        console.error("Error processing payment:", error);
      }
    },
  },
  mounted() {
    this.fetchExpensesByParticipantId(this.userId);
  },
});

app.mount("#app");

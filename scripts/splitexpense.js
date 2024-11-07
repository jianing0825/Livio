import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from "../src/firebase.js";

const app = createApp({
  data() {
    return {
      loading: true,
      submitted: false,
      user: null,
      room: null,
      roommates: [],
      pendingPaymentsByOthers: [],
      form: {
        description: "",
        amount: "",
        category: "Rent",
        participants: [],
        splitType: "equal",
        expenseSplit: {},
        paymentStatuses: {},
        roommates: {},
      },
    };
  },
  methods: {
    async handleSubmit() {
      // Split Expense
      this.handleExpenseSplit();
      // Process form data here
      const data = {
        ...JSON.parse(JSON.stringify(this.form)),
        timestamp: new Date().toISOString(),
        paidBy: this.user.id,
        roomId: this.room.id,
      };

      this.form.participants.forEach(participant => {
        data.paymentStatuses[participant] = "pending";
      });
      this.roommates.forEach(roommate => {
        if (roommate.id !== this.user.id) {
          data.roommates[
            roommate.id
          ] = `${roommate.firstName} ${roommate.lastName}`;
        }
      });

      try {
        this.loading = true;
        const docRef = await addDoc(collection(db, "expenses"), data);
        alert("Expense added successfully!");
      } catch (error) {
        console.error("Error adding document: ", error);
      } finally {
        this.loading = false;
        this.form.description = "";
        this.form.amount = "";
        this.form.category = "Rent";
        this.form.participants = [];
        this.form.splitType = "equal";
        this.form.expenseSplit = {};
      }
    },
    handleExpenseSplit() {
      if (this.form.splitType === "equal") {
        const amountPerPerson =
          this.form.amount / (this.form.participants.length + 1);
        this.form.participants.forEach(participant => {
          this.form.expenseSplit[participant] = amountPerPerson;
        });
      }
      console.log("Expense Split:", this.form.expenseSplit);
    },
    async getPendingPaymentsByOthers(userId) {
      const q = query(
        collection(db, "expenses"),
        where("paidBy", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const expenses = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(expense => {
          // Filter documents where any paymentStatuses value is "pending"
          return Object.values(expense.paymentStatuses).includes("pending");
        });

      const data = [];
      expenses.forEach(expense => {
        expense.participants.forEach(participant => {
          data.push({
            expenseId: expense.id,
            description: expense.description,
            pendingAmount: expense.expenseSplit[participant],
            status: expense.paymentStatuses[participant],
            participant: expense.roommates[participant],
          });
        });
      });

      this.pendingPaymentsByOthers = data;
    },
    async getUserById(userId) {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const user = { id: userDoc.id, ...userDoc.data() };
        return user;
      } else {
        console.log("No such document!");
      }
    },
    async fetchRoomsByUserId(roommateId) {
      const q = query(
        collection(db, "rooms"),
        where("roommates", "array-contains", roommateId)
      );
      const querySnapshot = await getDocs(q);
      const room = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))[0];
      return room;
    },
    getParticipantName(participantId) {
      const participant = this.roommates.find(
        roommate => roommate.id === participantId
      );
      return participant.firstName + " " + participant.lastName;
    },
  },
  async created() {
    const loggedInUserId = "RIgHvDQnglki83sixogm";
    // Get Logged In User Info and save it in localstorage
    this.user = await this.getUserById(loggedInUserId);

    localStorage.setItem("user", JSON.stringify(this.user));
    // Fetch user's Room
    this.room = await this.fetchRoomsByUserId(loggedInUserId);
    localStorage.setItem("user_room", JSON.stringify(this.room));
    console.log(this.room);
    // Fetch Roommates
    this.roommates = await Promise.all(
      this.room.roommates.map(async roommateId => {
        return await this.getUserById(roommateId);
      })
    );
    this.roommates = this.roommates.filter(
      roommate => roommate.id !== loggedInUserId
    );
    localStorage.setItem("roommates", JSON.stringify(this.roommates));
    await this.getPendingPaymentsByOthers(loggedInUserId);
    this.loading = false;
  },
  updated() {
    console.log(this.form.participants);
  },
});

app.mount("#app");

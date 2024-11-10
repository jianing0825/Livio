import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from "../src/firebase.js";

const app = createApp({
  data() {
    return {
      newMessage: "",
      messages: [],
      userId: null,
      user: null,
      otherUserId: null,
      otherUser: null,
      partners: [],
      users: [],
    };
  },
  methods: {
    // Get Users by ID
    async getUserById(userId) {
      const userDoc = await getDoc(doc(db, "users", userId));
      return userDoc.data();
    },
    // Get Messages between two users
    async getMessages() {
      const q = query(
        collection(db, "messages"),
        where("users", "array-contains", this.userId)
      );
      const querySnapshot = await getDocs(q);

      this.messages = querySnapshot.docs
        .filter(doc => {
          return doc.data().users.includes(this.otherUserId);
        })
        .map(doc => doc.data())
        .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
      console.log(this.messages);
    },
    // Send Message
    async sendMessage() {
      if (this.newMessage.trim() !== "") {
        const message = {
          message: this.newMessage,
          sender: this.userId,
          receiver: this.otherUserId,
          timestamp: new Date(),
          users: [this.userId, this.otherUserId],
        };
        console.log("Sending Message!");
        await addDoc(collection(db, "messages"), message);
        this.newMessage = "";
        await this.getMessages(); // Fetch messages again to update the view
      }
    },
    chat(userId) {
      window.location.href = `/chat.html?user=${this.userId}&with=${userId}`;
    },
    async getPartners() {
      const partnersQuerySnapshot = await getDocs(
        query(
          collection(db, "partners"),
          where("partners", "array-contains", this.userId)
        )
      );
      partnersQuerySnapshot.docs.map(doc => {
        doc.data().partners.forEach(partner => {
          if (partner !== this.userId) {
            this.partners.push(partner);
          }
        });
      });

      const usersQuerySnapshot = await getDocs(
        query(collection(db, "users"), where("movedIn", "==", false))
      );
      this.users = usersQuerySnapshot.docs
        .filter(doc => !this.partners.includes(doc.id))
        .map(doc => ({ id: doc.id, data: doc.data() }));
    },
  },
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const loggedInUserId = urlParams.get("user") || this.userId;
    const otherUserId = urlParams.get("with") || this.otherUserId;

    console.log(loggedInUserId, otherUserId);
    console.log(!loggedInUserId, !otherUserId);

    if (!loggedInUserId || !otherUserId) {
      return (window.location.href = "/loginpage.html");
    }
    this.userId = loggedInUserId;
    this.otherUserId = otherUserId;
    this.user = await this.getUserById(loggedInUserId);
    this.otherUser = await this.getUserById(otherUserId);
    await Promise.all([this.getPartners(), this.getMessages()]);
    // Listen for real-time updates
    const q = query(
      collection(db, "messages"),
      where("users", "array-contains", this.userId)
    );
    onSnapshot(q, snapshot => {
      this.messages = snapshot.docs
        .filter(doc => doc.data().users.includes(this.otherUserId))
        .map(doc => doc.data())
        .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
    });
  },
  //   watch for any changes in messages
  watch: {
    messages() {
      // add messages html to the chat box

      const msgPage = document.getElementById("msg-page");
      msgPage.innerHTML = "";
      this.messages.forEach(message => {
        const messageElement = document.createElement("div");
        messageElement.classList.add("textMsg");
        if (message.sender === this.userId)
          messageElement.classList.add("outgoingMsg");
        const textContainer = document.createElement("div");
        const textElement = document.createElement("p");
        textElement.textContent = message.message;
        textContainer.appendChild(textElement);
        const timeElement = document.createElement("span");
        timeElement.classList.add("time");
        timeElement.textContent = new Date(
          message.timestamp.seconds * 1000
        ).toLocaleString();
        textContainer.appendChild(timeElement);
        messageElement.appendChild(textContainer);
        msgPage.appendChild(messageElement);
      });
      this.$nextTick(() => {
        const chat = document.getElementById("msg-page");
        chat.scrollTop = chat.scrollHeight;
      });
    },
  },
});

app.mount("#app");

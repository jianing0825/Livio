import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
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
      usersIds: [],
      loading: true,
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
        let chatID = this.messages[0]?.chatID;
        if (this.messages.length === 0) {
          const chat = {
            timestamp: new Date(),
            users: [this.userId, this.otherUserId],
          };
          const chatRes = await addDoc(collection(db, "chats"), chat);
          chatID = chatRes.id;
          this.getPartners();
        }

        const message = {
          chatID: chatID,
          message: this.newMessage,
          sender: this.userId,
          receiver: this.otherUserId,
          timestamp: new Date(),
          users: [this.userId, this.otherUserId],
        };

        await addDoc(collection(db, "messages"), message);
        this.newMessage = "";
        await this.getMessages(); // Fetch messages again to update the view
      }
    },
    chat(userId) {
      window.location.href = `/chat.html?with=${userId}`;
    },
    async getPartners() {
      const chatsQuerySnapshot = await getDocs(
        query(
          collection(db, "chats"),
          where("users", "array-contains", this.userId)
        )
      );
      let userIds = [];
      chatsQuerySnapshot.docs.map(doc => {
        doc.data().users.forEach(user => {
          console.log(user);
          if (user !== this.userId) {
            userIds.push(user);
          }
        });
      });

      // Get users where Ids are from usersIds

      if (userIds.length === 0) return (this.loading = false);
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("__name__", "in", userIds));
      const querySnapshot = await getDocs(q);
      this.users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data(),
      }));
      this.loading = false;
    },
  },
  async mounted() {
    const userID = localStorage.getItem("userId");
    if (!userID) return (window.location.href = "/loginpage.html");
    this.userId = userID;
    const urlParams = new URLSearchParams(window.location.search);
    const loggedInUserId = userID;
    const otherUserId = urlParams.get("with") || this.otherUserId;

    if (!loggedInUserId || !otherUserId) {
      return (window.location.href = "/allexpenses.html");
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
      if (msgPage) msgPage.innerHTML = "";
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
        if (textContainer) textContainer.appendChild(timeElement);
        if (messageElement) messageElement.appendChild(textContainer);
        if (msgPage) msgPage.appendChild(messageElement);
      });
      this.$nextTick(() => {
        const chat = document.getElementById("msg-page");
        if (chat) chat.scrollTop = chat.scrollHeight;
      });
    },
  },
});

app.mount("#app");

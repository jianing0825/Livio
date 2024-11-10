import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import {
  collection,
  query,
  addDoc,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from "../src/firebase.js";

const app = createApp({
  data() {
    return {
      userId: localStorage.getItem('userId'),
      partners: [],
      users: [],
      tab: "Explore",
    };
  },
  methods: {
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
    chat(partnerId) {
      window.location = `chat.html?user=${this.userId}&with=${partnerId}`;
    },
    async partnerUp(partnerId) {
      console.log(partnerId);
      const partnersData = {
        partners: [this.userId, partnerId],
        timestamp: new Date(),
      };
      try {
        await addDoc(collection(db, "partners"), partnersData);
        alert("Added as partner successfully!");
        window.location.reload();
      } catch (e) {
        console.error("Error adding partners: ", e);
      }
    },
    changeTab(tab) {
      const chatElem = document.getElementById("sub-nav-item-chat");
      const chooseElem = document.getElementById("sub-nav-item-choose");
      const exploreElem = document.getElementById("sub-nav-item-explore");
      if (tab === "Chats") {
        chatElem.classList.add("active");
        chooseElem.classList.remove("active");
        exploreElem.classList.remove("active");
      } else if (tab === "Choose your roommate") {
        chooseElem.classList.add("active");
        chatElem.classList.remove("active");
        exploreElem.classList.remove("active");
      } else {
        exploreElem.classList.add("active");
        chatElem.classList.remove("active");
        chooseElem.classList.remove("active");
      }
      this.tab = tab;
    },
    renderCards() {
      if (this.tab === "Explore") {
  // Filter users based on the current user's gender
  const filteredUsers = this.users.filter(user => user.data.gender === this.currentUserGender);

        const parentContainer = document.querySelector(".roommate-grid");
        parentContainer.classList.remove("chat-grid");
        parentContainer.innerHTML = "";
        this.users.forEach(user => {
          const container = document.createElement("div");
          container.classList.add("roommate-card");
         // Create the updated innerHTML for the roommate card with the new design
      container.innerHTML = `
      <img src="${user.data.profileImage || 'default-profile.jpg'}" alt="${user.data.firstName || ''} ${user.data.lastName || ''}'s profile" class="profile-photo">
      <div class="roommate-info">
        <div class="roommate-header">
          <h3 class="roommate-name">${user.data.firstName || ""} ${user.data.lastName || ""}</h3>
          <div class="gender-badge">
            <i class="fas fa-user"></i> ${user.data.gender || "N/A"}
          </div>
        </div>
        <div class="interest-tags">
          ${user.data.interests
            .map((interest) => `<span class="interest-tag">${interest}</span>`)
            .join("")}
        </div>
        <div class="roommate-details">
          <p>${user.data.preference || "Looking for roommate in downtown area"}</p>
          <p>${user.data.environment || "Prefers quiet environment"}</p>
        </div>
        <button class="chat-button">Chat</button>
      </div>
    `;
          container
            .querySelector(".chat-button")
            .addEventListener("click", () => this.chat(user.id));

          parentContainer.appendChild(container);
        });
      } else if (this.tab === "Chats") {
        const parentContainer = document.querySelector(".roommate-grid");
        parentContainer.classList.remove("chat-grid");
        parentContainer.innerHTML = "";
        // add class to parent container
        parentContainer.classList.add("chat-grid");
        this.users.forEach(user => {
          const container = document.createElement("div");
          container.classList.add("chat-item");
          container.addEventListener("click", () => this.chat(user.id));
          container.innerHTML = ` <img src="https://images.unsplash.com/photo-1719937206498-b31844530a96?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8" alt="Profile Picture" class="chat-avatar"> <div class="chat-info"> <div class="chat-name">${user.data.firstName || ""
            } ${user.data.lastName || ""
            }</div> <div class="chat-preview">Click to continue chat</div> </div> `;
          parentContainer.appendChild(container);
        });
      } else if (this.tab === "Choose your roommate") {
        const parentContainer = document.querySelector(".roommate-grid");
        parentContainer.classList.remove("chat-grid");
        parentContainer.innerHTML = "";
        this.users.forEach(user => {
          const container = document.createElement("div");
          container.classList.add("choose-item");
          container.innerHTML = `<div class="choose-profile">
                        <img src="https://images.unsplash.com/photo-1685903772095-f07172808761?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="https://images.unsplash.com/photo-1685903772095-f07172808761?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" class="choose-avatar">
                        <div class="choose-info">
                            <div class="choose-name">${user.data.firstName || ""
            } ${user.data.lastName || ""}</div>
                            <div class="choose-traits">${user.data.interests
              .map(trait => trait.split("\n").join("<br />"))
              .join(", ")}</div>
                        </div>
                    </div>
                    <button class="choose-button" data-id="${user.id
            }">Choose</button>`;
          container
            .querySelector(".choose-button")
            .addEventListener("click", () => this.partnerUp(user.id));
          parentContainer.appendChild(container);
        });
      }
    },
  },
  async mounted() {
    await this.getPartners();
  },
  watch: {
    tab() {
      this.renderCards();
    },
    users() {
      this.renderCards();
    },
  },
});

app.mount("#app");

import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
import {
  collection,
  query,
  addDoc,
  where,
  getDocs,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { db } from "../src/firebase.js";

const app = createApp({
  data() {
    return {
      userId: "",
      partners: [],
      users: [],
      tab: "Explore",
      chatters: [],
      loading: true,
      selectedUser: null,
      showConfirmModal: false,
    };
  },
  methods: {
    showConfirmation(user) {
      this.selectedUser = user;
      const modal = document.getElementById("profileModal");
      modal.classList.add("show");
      
      // Update modal content with user data
      const profileImage = modal.querySelector(".profile-image");
      const profileName = modal.querySelector(".profile-info h3");
      const profileTraits = modal.querySelector(".profile-info .traits");
      
      profileImage.src = user.data.profileImage || 'default-profile.jpg';
      profileName.textContent = `${user.data.firstName} ${user.data.lastName}`;
      profileTraits.innerHTML = `
        <div class="traits-section">
          <p><strong>Interests:</strong> ${user.data.interests.join(", ")}</p>
          <p><strong>Preferences:</strong> ${user.data.preference || "Not specified"}</p>
          <p><strong>Environment:</strong> ${user.data.environment || "Not specified"}</p>
        </div>
      `;
      
      // Add event listeners for the confirm and cancel buttons
      const confirmButton = modal.querySelector(".confirm-button");
      const cancelButton = modal.querySelector(".cancel-button");
      
      // Remove any existing event listeners
      confirmButton.replaceWith(confirmButton.cloneNode(true));
      cancelButton.replaceWith(cancelButton.cloneNode(true));
      
      // Get the new buttons after replacement
      const newConfirmButton = modal.querySelector(".confirm-button");
      const newCancelButton = modal.querySelector(".cancel-button");
      
      // Add new event listeners
      newConfirmButton.addEventListener("click", () => this.confirmPartnerChoice());
      newCancelButton.addEventListener("click", () => this.closeConfirmation());
    },

    closeConfirmation() {
      const modal = document.getElementById("profileModal");
      modal.classList.remove("show");
      this.selectedUser = null;
    },

    async confirmPartnerChoice() {
      if (!this.selectedUser) {
        console.log("No selected user");
        return;
      }
      
      const confirmationModal = document.getElementById("confirmationModal");
      const modalTitle = confirmationModal.querySelector(".modal-title");
      const modalBody = confirmationModal.querySelector(".modal-body");
      const okButton = confirmationModal.querySelector(".confirm-button");
      
      try {
        console.log("Starting partner confirmation for user:", this.selectedUser.id);
        // Close the initial confirmation modal
        this.closeConfirmation();
        
        // Add the partner
        await this.partnerUp(this.selectedUser.id);
        console.log("Partner successfully added");
        
        // Show success confirmation
        modalTitle.textContent = "Success!";
        modalTitle.style.color = "#15803d";
        modalBody.innerHTML = `
          <div class="text-center">
            <i class="fas fa-check-circle" style="color: #15803d; font-size: 48px; margin-bottom: 16px;"></i>
            <p>You have successfully chosen <strong>${this.selectedUser.data.firstName} ${this.selectedUser.data.lastName}</strong> as your roommate!</p>
          </div>
        `;
        
        // Add event listener for the OK button
        okButton.onclick = () => {
          confirmationModal.classList.remove("show");
          window.location.reload();
        };
        
        // Show the confirmation modal
        confirmationModal.classList.add("show");
        
      } catch (error) {
        console.error("Error in confirmPartnerChoice:", error);
        modalTitle.textContent = "Error";
        modalTitle.style.color = "#dc2626";
        modalBody.innerHTML = `
          <div class="text-center">
            <i class="fas fa-exclamation-circle" style="color: #dc2626; font-size: 48px; margin-bottom: 16px;"></i>
            <p>There was an error processing your choice. Please try again.</p>
          </div>
        `;
        
        okButton.onclick = () => {
          confirmationModal.classList.remove("show");
        };
        
        confirmationModal.classList.add("show");
      }
    },

    async getUserById(userId) {
      const userDoc = await getDoc(doc(db, "users", userId));
      this.user = { id: userDoc.id, data: userDoc.data() };
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
        .filter(
          doc =>
            doc.id !== this.userId &&
            doc.data().gender === this.user.data.gender
        )
        .map(doc => ({ id: doc.id, data: doc.data() }));
    },

    chat(partnerId) {
      window.location = `chat.html?with=${partnerId}`;
    },

    async getChatters() {
      const chatsQuerySnapshot = await getDocs(
        query(
          collection(db, "chats"),
          where("users", "array-contains", this.userId)
        )
      );
      let userIds = [];
      chatsQuerySnapshot.docs.map(doc => {
        doc.data().users.forEach(user => {
          if (user !== this.userId) {
            userIds.push(user);
          }
        });
      });

      if (userIds.length === 0) return (this.loading = false);
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("__name__", "in", userIds));
      const querySnapshot = await getDocs(q);

      this.chatters = querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data(),
      }));
    },

    async partnerUp(partnerId) {
      try {
        console.log("Starting partnerUp with partnerId:", partnerId);
        const partnersData = {
          partners: [this.userId, partnerId],
          timestamp: new Date(),
        };
        console.log("Partners data:", partnersData);
        
        // Add the document to Firestore
        const docRef = await addDoc(collection(db, "partners"), partnersData);
        console.log("Document added with ID:", docRef.id);
        
        if (docRef.id) {
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error in partnerUp:", error);
        throw error; // Propagate the error to be handled by the caller
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

    async renderCards() {
      if (this.tab === "Explore") {
        const parentContainer = document.querySelector(".roommate-grid");
        parentContainer.classList.remove("chat-grid");
        parentContainer.innerHTML = "";
        this.users.forEach(user => {
          const container = document.createElement("div");
          container.classList.add("roommate-card");
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
        parentContainer.classList.add("chat-grid");
        this.users.forEach(user => {
          const container = document.createElement("div");
          container.classList.add("chat-item");
          container.addEventListener("click", () => this.chat(user.id));
          container.innerHTML = `
            <img src="${user.data.profileImage || 'default-profile.jpg'}" alt="Profile Picture" class="chat-avatar">
            <div class="chat-info">
              <div class="chat-name">${user.data.firstName || ""} ${user.data.lastName || ""}</div>
              <div class="chat-preview">Click to continue chat</div>
            </div>
          `;
          parentContainer.appendChild(container);
        });
      } else if (this.tab === "Choose your roommate") {
        this.loading = true;
        await this.getChatters();
        this.loading = false;
        const parentContainer = document.querySelector(".roommate-grid");
        parentContainer.classList.remove("chat-grid");
        parentContainer.innerHTML = "";
        
        this.chatters.forEach(user => {
          const container = document.createElement("div");
          container.classList.add("choose-item");
          container.innerHTML = `
            <div class="choose-profile">
              <img src="${user.data.profileImage || 'default-profile.jpg'}" alt="Profile Image" class="choose-avatar">
              <div class="choose-info">
                <div class="choose-name">${user.data.firstName || ""} ${user.data.lastName || ""}</div>
                <div class="choose-traits">${user.data.interests.join(", ")}</div>
              </div>
            </div>
            <button class="choose-button" data-id="${user.id}">Choose</button>
          `;
          
          container
            .querySelector(".choose-button")
            .addEventListener("click", () => this.showConfirmation(user));
          
          parentContainer.appendChild(container);
        });
      }
    },
  },

  async mounted() {
    const userID = localStorage.getItem("userId");
    if (!userID) return (window.location.href = "/loginpage.html");
    this.userId = userID;
    await this.getUserById(userID);
    await this.getPartners();

    // Set up modal close handlers
    document.querySelectorAll(".modal-close").forEach(button => {
      button.addEventListener("click", () => {
        button.closest(".modal").classList.remove("show");
      });
    });
    
    // Close modals when clicking outside
    window.addEventListener("click", e => {
      if (e.target.classList.contains("modal")) {
        e.target.classList.remove("show");
      }
    });
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
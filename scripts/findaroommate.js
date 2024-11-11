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
      partnerConfirmed: false, // New flag to track if partner is confirmed
      partnerSelected:false,
      hasSubmitted: localStorage.getItem("hasSubmitted"),
      roomBooked:false,


    };
  },
  methods: {
    async validateBookedRomm(){
      const userId =  localStorage.getItem("userId")
        const applicationsQuerySnapshot = await getDocs(query( collection(db, "rentalApplications"), where("roommates", "array-contains", userId) ));
        console.log(applicationsQuerySnapshot.docs);
        this.roomBooked = applicationsQuerySnapshot.docs.length>0;
        console.log(this.roomBooked)
      },
    async getUserById(userId) {
      const userDoc = await getDoc(doc(db, "users", userId));
      this.user = { id: userDoc.id, data: userDoc.data() };

    },
    // async getPartners() {
    //   const partnersQuerySnapshot = await getDocs(
    //     query(
    //       collection(db, "partners"),
    //       where("partners", "array-contains", this.userId)
    //     )
    //   );
    //   partnersQuerySnapshot.docs.map(doc => {
    //     doc.data().partners.forEach(partner => {
    //       if (partner !== this.userId) {
    //         this.partners.push(partner);
    //       }
    //     });
    //   });

    //   const usersQuerySnapshot = await getDocs(
    //     query(collection(db, "users"), where("movedIn", "==", false))
    //   );

    //   this.users = usersQuerySnapshot.docs
    //     .filter(
    //       doc =>
    //         // !this.partners.includes(doc.id) &&
    //         doc.id !== this.userId &&
    //         doc.data().gender === this.user.data.gender
    //     )
    //     .map(doc => ({ id: doc.id, data: doc.data() }));
    // },
    async getPartners() {
      // Retrieve partners excluding the current user
      const userPartnersQuerySnapshot = await getDocs(
        query(
          collection(db, "partners"),
          where("partners","array-contains",this.userId)
        )
      );
      
      if(userPartnersQuerySnapshot.docs.length>0) {
        this.partnerSelected = true;
        this.changeTab("Chats")
      }

      const partnersQuerySnapshot = await getDocs(
        query(
          collection(db, "partners")
        )
      );
      partnersQuerySnapshot.docs.map(doc => {
        doc.data().partners.forEach(partner => {
          if (partner !== this.userId) {
            this.partners.push(partner);
          }
        });
      });

      // Query users of the same gender as the current user
      const usersQuerySnapshot = await getDocs(
        query(
          collection(db, "users"),
          where("gender", "==", this.user.data.gender)
        )
      );

      // Filter out partners and the current user, then map results to `this.users`
      this.users = usersQuerySnapshot.docs
        .filter(doc => doc.id !== this.userId && !this.partners.includes(doc.id))
        .map(doc => ({ id: doc.id, data: doc.data() }));
    }, chat(partnerId) {
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
      doc.id !== this.userId  // Exclude the current user here

      this.chatters = querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data(),
      }));

    }
    ,
    async partnerUp(partnerId) {
      console.log(partnerId);
      // Show confirmation dialog
      const confirmChoice = window.confirm("Confirm choosing this person as your partner?");
      if (!confirmChoice) return; // Exit if user cancels

      const partnersData = {
        partners: [this.userId, partnerId],
        timestamp: new Date(),
      };
      try {
        await addDoc(collection(db, "partners"), partnersData);
        alert("Added as partner successfully!");
        this.partnerConfirmed = true;
        this.tab = "Chats";

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
        if(this.partnerSelected){
          chooseElem.remove();
          exploreElem.remove();
        }else{
          chooseElem.classList.remove("active");
          exploreElem.classList.remove("active");
  
        }
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
        console.log("Current User ID on Explore page:", this.userId); // Print current user’s ID

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
        await this.getChatters();

        const parentContainer = document.querySelector(".roommate-grid");
        parentContainer.classList.remove("chat-grid");
        parentContainer.innerHTML = "";
        // add class to parent container
        parentContainer.classList.add("chat-grid");
        this.chatters.forEach(user => {
          const container = document.createElement("div");
          container.classList.add("chat-item");
          container.addEventListener("click", () => this.chat(user.id));
          container.innerHTML = ` <img src="https://images.unsplash.com/photo-1719937206498-b31844530a96?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxfHx8ZW58MHx8fHx8" alt="Profile Picture" class="chat-avatar"> <div class="chat-info"> <div class="chat-name">${user.data.firstName || ""
            } ${user.data.lastName || ""
            }</div> <div class="chat-preview">Click to continue chat</div> </div> `;
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
    this.validateBookedRomm()

    const userID = localStorage.getItem("userId");
    if (!userID) return (window.location.href = "/loginpage.html");
    this.userId = userID;
    await this.getUserById(userID);
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

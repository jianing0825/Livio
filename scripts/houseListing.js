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

const appVue = Vue.createApp({
  data() {
    return {
      partners: [],
      roomBooked:false,
      hasSubmitted: localStorage.getItem("hasSubmitted"), // key: value
    };
  },
  methods: {
    async getPartners() {
      const userId = localStorage.getItem("userId");
      alert("Making a request!");
      // Retrieve partners excluding the current user
      const userPartnersQuerySnapshot = await getDocs(
        query(
          collection(db, "partners"),
          where("partners", "array-contains", userId)
        )
      );
      let partnerIDs = [];
      userPartnersQuerySnapshot.forEach(user => {
        partnerIDs = user.data().partners.filter(partner => userId !== partner);
      });

      const usersRef = collection(db, "users");
      console.log(partnerIDs);
      const q = query(usersRef, where("__name__", "in", partnerIDs));
      const querySnapshot = await getDocs(q);
      this.partners = querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data(),
      }));

      console.log(this.partners);
    },
   async validateBookedRomm(){
    const userId =  localStorage.getItem("userId")
      const applicationsQuerySnapshot = await getDocs(query( collection(db, "rentalApplications"), where("roommates", "array-contains", userId) ));
	    console.log(applicationsQuerySnapshot.docs);
      this.roomBooked = applicationsQuerySnapshot.docs.length>0;
      console.log(this.roomBooked)
    }
  },
  mounted() {
    this.validateBookedRomm()
    this.getPartners();
  },
});

appVue.mount("#app");

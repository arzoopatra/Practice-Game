import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTjH7pnpvWqQgctodualckoGn0PIxbyLM",
  authDomain: "practicegame-signify.firebaseapp.com",
  projectId: "practicegame-signify",
  storageBucket: "practicegame-signify.firebasestorage.app",
  messagingSenderId: "64292430422",
  appId: "1:64292430422:web:bc3ed4beb2b13980e291f7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export database for use in other files
export const db = getFirestore(app);

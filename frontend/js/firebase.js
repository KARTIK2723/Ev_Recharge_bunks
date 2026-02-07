// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔴 REPLACE with your Firebase config
export const firebaseConfig = {
  apiKey: "AIzaSyDwyvc3AG4GsPYvY-P-v6lC9g0JOr2lZu4",
  authDomain: "ev-recharge-bunks.firebaseapp.com",
  projectId: "ev-recharge-bunks",
  storageBucket: "ev-recharge-bunks.firebasestorage.app",
  messagingSenderId: "795392813186",
  appId: "1:795392813186:web:5b5688cc57dc1576a56c9b"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);

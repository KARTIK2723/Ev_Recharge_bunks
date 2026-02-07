import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { auth, app } from "./firebase.js";

const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const authBtn = document.getElementById("authBtn");
  const userMenu = document.getElementById("userMenu");
  const userText = document.getElementById("userText");
  const dropdownName = document.getElementById("dropdownName");
  const dropdownEmail = document.getElementById("dropdownEmail");
  const logoutBtn = document.getElementById("logoutBtn");

  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");

  let lockedOpen = false;

  /* ================= AUTH STATE ================= */
  onAuthStateChanged(auth, async (user) => {
    if (user && window.startUserTutorial) {
    window.startUserTutorial();}
    if (user) {
      authBtn?.classList.add("hidden");
      userMenu?.classList.remove("hidden");

      const snap = await getDoc(doc(db, "users", user.uid));
      const data = snap.exists() ? snap.data() : {};

      if (userText) userText.textContent = `Hello, ${data.username || "User"}`;
      if (dropdownName) dropdownName.textContent = data.username || "User";
      if (dropdownEmail) dropdownEmail.textContent = user.email;

      userMenu?.addEventListener("mouseenter", () => {
        userMenu.classList.add("open");
      });

      userMenu?.addEventListener("mouseleave", () => {
        if (!lockedOpen) userMenu.classList.remove("open");
      });

      userText?.addEventListener("click", (e) => {
        e.stopPropagation();
        lockedOpen = !lockedOpen;
        userMenu.classList.toggle("open", lockedOpen);
      });

      document.addEventListener("click", () => {
        lockedOpen = false;
        userMenu?.classList.remove("open");
      });

      logoutBtn?.addEventListener("click", async () => {
        await signOut(auth);
        location.reload();
      });

    } else {
      authBtn?.classList.remove("hidden");
      userMenu?.classList.add("hidden");

      authBtn?.addEventListener("click", () => {
        window.location.href = "pages/login.html";
      });
    }
  });

  /* ================= REGISTER ================= */
  registerBtn?.addEventListener("click", registerUser);
  loginBtn?.addEventListener("click", loginUser);
});

/* ================= FUNCTIONS ================= */

async function registerUser() {
  const username = document.getElementById("username")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;
  const confirm = document.getElementById("confirmPassword")?.value;

  if (!username || !email || !password) {
    alert("All fields are required");
    return;
  }

  if (password !== confirm) {
    alert("Passwords do not match");
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", cred.user.uid), {
      username,
      email,
      createdAt: new Date()
    });

    alert("✅ Account created");
    window.location.href = "../index.html";
  } catch (err) {
    alert(err.message);
  }
}

async function loginUser() {
  const email = document.getElementById("email")?.value.trim();
  const password = document.getElementById("password")?.value;

  if (!email || !password) {
    alert("Email & password required");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("✅ Logged in");
    window.location.href = "../index.html";
  } catch (err) {
    alert(err.message);
  }
}

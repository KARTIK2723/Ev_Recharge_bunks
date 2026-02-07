/* ================= IMPORTS (MUST BE FIRST) ================= */
import { auth } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  runTransaction,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= INIT ================= */
const db = getFirestore();

let currentUser = null;
let selectedBunkId = null;

/* ================= HIDE MODAL ON LOAD ================= */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("bookingModal")?.classList.add("hidden");
});

/* ================= AUTH STATE ================= */
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});


/* ================= OPEN MODAL ================= */
function openBookingModal(bunkId) {
  selectedBunkId = bunkId;
  document.getElementById("bookingModal")?.classList.remove("hidden");
}

/* ================= CANCEL MODAL ================= */
document.getElementById("cancelBooking")?.addEventListener("click", () => {
  document.getElementById("bookingModal")?.classList.add("hidden");
});

/* ================= BOOK BUTTON HANDLER ================= */
document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("book-btn")) return;

  if (!currentUser) {
    alert("Please login to book a slot");
    window.location.href = "pages/login.html";
    return;
  }

  openBookingModal(e.target.dataset.id);
});

/* ================= CONFIRM BOOKING ================= */
document.getElementById("confirmBooking")?.addEventListener("click", async () => {
  if (!currentUser || !selectedBunkId) return;

  const slotCount = Number(document.getElementById("slotCount").value);

  try {
    await runTransaction(db, async (transaction) => {
      const bunkRef = doc(db, "ev_bunks", selectedBunkId);
      const bunkSnap = await transaction.get(bunkRef);

      if (!bunkSnap.exists()) {
        throw new Error("Bunk not found");
      }

      const bunk = bunkSnap.data();

      if (bunk.availableSlots < slotCount) {
        throw new Error("Not enough slots available");
      }

      // Update slots
      transaction.update(bunkRef, {
        availableSlots: bunk.availableSlots - slotCount,
      });

      // Create booking (INSIDE transaction)
      const bookingRef = doc(collection(db, "bookings"));
      const EXPIRY_MINUTES = 10;
      transaction.set(bookingRef, {
        userId: currentUser.uid,
        bunkId: selectedBunkId,
        slots: slotCount,
        lat: bunk.lat,
        lng: bunk.lng,
        city: bunk.city,
        state: bunk.state,
        status: "active",
        createdAt: serverTimestamp(),
        expiresAt: Date.now() + EXPIRY_MINUTES * 60 * 1000
      });
    });

    alert("✅ Booking successful");
    document.getElementById("bookingModal").classList.add("hidden");

  } catch (err) {
    console.error(err);
    alert("❌ " + err.message);
  }
});

  

/*cancel bookink*/ 
async function cancelBooking(bookingId) {
  try {
    await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, "bookings", bookingId);
      const bookingSnap = await transaction.get(bookingRef);

      if (!bookingSnap.exists()) {
        throw new Error("Booking not found");
      }

      const booking = bookingSnap.data();

      if (booking.userId !== currentUser.uid) {
        throw new Error("Unauthorized");
      }

      if (booking.status !== "active") {
        throw new Error("Booking already closed");
      }

      const bunkRef = doc(db, "ev_bunks", booking.bunkId);
      const bunkSnap = await transaction.get(bunkRef);

      if (!bunkSnap.exists()) {
        throw new Error("Bunk not found");
      }

      const bunk = bunkSnap.data();

      // ✅ Restore slots
      transaction.update(bunkRef, {
        availableSlots: bunk.availableSlots + booking.slots
      });

      // ❌ Mark booking cancelled
      transaction.update(bookingRef, {
        status: "cancelled",
        cancelledAt: serverTimestamp()
      });
    });

    alert("✅ Booking cancelled & slots restored");

  } catch (err) {
    alert("❌ " + err.message);
  }
}

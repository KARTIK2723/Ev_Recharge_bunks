import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const list = document.getElementById("bookingList");
const emptyState = document.getElementById("emptyState");

// ---------- AUTH ----------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  loadMyBookings(user.uid);
});

// ---------- HELPERS ----------
function formatTime(ms) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ---------- LOAD BOOKINGS ----------
function loadMyBookings(uid) {
  const q = query(
    collection(db, "bookings"),
    where("userId", "==", uid),
    where("status", "==", "active")
  );

  onSnapshot(q, (snapshot) => {
    list.innerHTML = "";

    if (snapshot.empty) {
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");

    snapshot.forEach((docSnap) => {
      renderBooking(docSnap.id, docSnap.data());
    });
  });
}

// ---------- RENDER ----------
function renderBooking(id, booking) {
  const card = document.createElement("div");
  card.className = "booking-card";

  card.innerHTML = `
    <div class="booking-info">
      <div class="booking-top">
        <h3>${booking.city}</h3>
        <span class="badge active">ACTIVE</span>
      </div>

      <p class="meta">📍 State: <strong>${booking.state}</strong></p>
      <p class="meta">⚡ Slots Reserved: <strong>${booking.slots}</strong></p>
      <p class="meta timer">
        ⏳ Expires in <span id="timer-${id}">--:--</span>
      </p>
    </div>

    <div class="booking-action">
      <button class="nav-btn">Navigate</button>

      <button class="cancel-btn">Cancel</button>
    </div>
  `;
  const navBtn = card.querySelector(".nav-btn");
  const cancelBtn = card.querySelector(".cancel-btn");

  navBtn.addEventListener("click", () => {
    navigateToStation(booking);
  });

  cancelBtn.addEventListener("click", () => {
    cancelBooking(id, booking);
  });
  function navigateToStation(booking) {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  if (!booking.lat || !booking.lng) {
    alert("Station location not available");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      const destLat = booking.lat;
      const destLng = booking.lng;

      const url =
        `https://www.google.com/maps/dir/?api=1` +
        `&origin=${userLat},${userLng}` +
        `&destination=${destLat},${destLng}` +
        `&travelmode=driving`;

      window.open(url, "_blank");
    },
    () => {
      alert("Unable to fetch your location");
    }
  );
}



  // Cancel button
  card.querySelector(".cancel-btn").onclick = () =>
    cancelBooking(id, booking, false);

  list.appendChild(card);

  // ---------- COUNTDOWN ----------
  const timerEl = card.querySelector(`#timer-${id}`);

  const interval = setInterval(async () => {
    const remaining = booking.expiresAt - Date.now();

    if (remaining <= 0) {
      clearInterval(interval);
      timerEl.textContent = "Expired";
      await cancelBooking(id, booking, true);
      return;
    }

    timerEl.textContent = formatTime(remaining);
  }, 1000);
}

// ---------- CANCEL ----------
async function cancelBooking(bookingId, booking, auto) {
  if (!auto && !confirm("Cancel this booking?")) return;

  try {
    await runTransaction(db, async (tx) => {
      const bookingRef = doc(db, "bookings", bookingId);
      const bunkRef = doc(db, "ev_bunks", booking.bunkId);

      const bunkSnap = await tx.get(bunkRef);
      if (!bunkSnap.exists()) throw "Bunk not found";

      tx.update(bunkRef, {
        availableSlots: bunkSnap.data().availableSlots + booking.slots
      });

      tx.update(bookingRef, {
        status: auto ? "expired" : "cancelled",
        cancelledAt: new Date()
      });
    });

    if (!auto) alert("✅ Booking cancelled");
  } catch (err) {
    alert("❌ " + err);
  }
}

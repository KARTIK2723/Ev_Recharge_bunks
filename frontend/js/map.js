import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// map.js

export let allBunks = [];


export function renderBunks(bunks) {
  clearMap(); // 🔥 reuse existing logic

  bunks.forEach(bunk => {
    addBunkToMapAndList(bunk);
  });
}





let userLocation = null;
let userMarker = null;

function locateUser() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      userLocation = [lat, lng];

      // Center map on user
      map.setView(userLocation, 14);

      // Add / update marker
      if (userMarker) {
        userMarker.setLatLng(userLocation);
      } else {
        userMarker = L.marker(userLocation, {
          icon: L.icon({
            iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          }),
        })
          .addTo(map)
          .bindPopup("📍 You are here")
          .openPopup();
      }
    },
    (error) => {
      alert("Please allow location access for navigation");
      console.error(error);
    }
    
  );
}
locateUser();

// ================= MAP SETUP =================
const map = L.map("map").setView([28.6139, 77.2090], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

// ================= STATE CENTERS =================
const stateCenters = {
  DL: [28.6139, 77.2090],
  MH: [19.7515, 75.7139],
  KA: [15.3173, 75.7139],
  TN: [11.1271, 78.6569],   // ✅ ADD THIS
  GJ: [22.2587, 71.1924],
  RJ: [27.0238, 74.2179],
  UP: [26.8467, 80.9462],
  TS: [18.1124, 79.0193],
  WB: [22.9868, 87.8550],
  MP: [22.9734, 78.6569],
};

// ================= UI ELEMENTS =================
const bunkList = document.getElementById("bunkList");
let markers = [];
let unsubscribe = null;

// ================= HELPERS =================
function clearMap() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  bunkList.innerHTML = "";
}

// ================= ADD BUNK =================
function addBunkToMapAndList(bunk) {
  const marker = L.marker([bunk.lat, bunk.lng]).addTo(map);

  marker.bindPopup(`
    <strong>${bunk.name}</strong><br>
    ${bunk.city}<br>
    Slots: ${bunk.availableSlots}/${bunk.totalSlots}
  `);

  markers.push(marker);

  const card = document.createElement("div");
  card.className = "bunk-card";

 if (bunk.availableSlots === 0) {
  card.classList.add("full");
} else if (bunk.availableSlots <= 2) {
  card.classList.add("low");
}

card.innerHTML = `
  <strong>${bunk.name}</strong><br>
  <small>${bunk.city}</small><br>
  <small>Slots: ${bunk.availableSlots}/${bunk.totalSlots}</small>
  <br><br>

  <button
    class="book-btn"
    data-id="${bunk.id}"
    ${bunk.availableSlots === 0 ? "disabled" : ""}
  >
    ${bunk.availableSlots === 0 ? "Full" : "Book Slot"}
  </button>
`;


  // Card click → center map
  card.onclick = () => {
    map.setView([bunk.lat, bunk.lng], 15);
    marker.openPopup();
  };

  bunkList.appendChild(card);
}

// ================= REALTIME LOAD =================
function loadBunksRealtime(stateCode) {
  clearMap();

  if (unsubscribe) unsubscribe();

  const q = query(
    collection(db, "ev_bunks"),
    where("state", "==", stateCode),
    where("status", "==", "active")
  );

 unsubscribe = onSnapshot(q, snapshot => {
  clearMap();
  allBunks = []; // 🔥 RESET & FILL FOR SEARCH

  snapshot.forEach(doc => {
    const bunk = { id: doc.id, ...doc.data() };
    allBunks.push(bunk);              // ✅ store for search
    addBunkToMapAndList(bunk);         // ✅ render normally
  });
});
}

// ================= STATE SELECTION =================
document.getElementById("confirmState").onclick = () => {
  const selectedState = document.getElementById("stateSelect").value;

  if (!selectedState) {
    alert("Please select a state");
    return;
  }

  map.setView(stateCenters[selectedState], 7);
  document.getElementById("stateModal").style.display = "none";

  loadBunksRealtime(selectedState);
};

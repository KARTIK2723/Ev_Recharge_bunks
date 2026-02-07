/*********************************
 * SEARCH BAR + DROPDOWN LOGIC
 *********************************/

/* DOM ELEMENTS */
import { allBunks, renderBunks } from "./map.js";

const searchInput = document.getElementById("searchInput");
const dropdown = document.getElementById("searchDropdown");
const recentBox = document.getElementById("recentSearches");


/* USER LOCATION */
let userLocation = null;

navigator.geolocation.getCurrentPosition(
  (pos) => {
    userLocation = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    };
  },
  () => {
    console.warn("Location access denied");
  }
);

/*********************************
 * DISTANCE CALCULATION
 *********************************/
function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

/*********************************
 * DROPDOWN OPEN / CLOSE
 *********************************/
searchInput.addEventListener("focus", () => {
  dropdown.classList.remove("hidden");
  loadRecentSearches();
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrapper")) {
    dropdown.classList.add("hidden");
  }
});

/*********************************
 * DROPDOWN CLICK HANDLER
 *********************************/
dropdown.addEventListener("click", (e) => {
    console.log("Dropdown clicked"); 
  const item = e.target.closest(".dropdown-item");
  if (!item) return;
    console.log("Item clicked", item.dataset.range);
  const type = item.dataset.type;
  const range = Number(item.dataset.range);

  if (type === "nearby") {
    applyNearbySearch(range);
    searchInput.value = `EV bunks within ${range} km`;
    saveRecentSearch(searchInput.value);
    dropdown.classList.add("hidden");
  }
});

/*********************************
 * NEARBY SEARCH
 *********************************/
function applyNearbySearch(rangeKm) {
  const noResultsMsg = document.getElementById("noResultsMsg");
if (!noResultsMsg) return; // 🔒 safety guard


  if (!userLocation) {
    alert("Enable location to find nearby EV bunks");
    return;
  }

  const filtered = allBunks.filter(bunk => {
    const dist = getDistanceKm(
      userLocation.lat,
      userLocation.lng,
      bunk.lat,
      bunk.lng
    );
    return dist <= rangeKm;
  });

  if (filtered.length === 0) {
    noResultsMsg.style.display = "block";
    noResultsMsg.textContent = `❌ No EV bunks found within ${rangeKm} km`;
    return; // 🔥 IMPORTANT: do NOT clear map
  }

  noResultsMsg.style.display = "none";
  renderBunks(filtered);
}


/*********************************
 * TEXT SEARCH (BY NAME)
 *********************************/
searchInput.addEventListener("input", () => {
  const text = searchInput.value.trim().toLowerCase();
  const noResultsMsg = document.getElementById("noResultsMsg");

  if (!text) {
    noResultsMsg.style.display = "none";
    renderBunks(allBunks);
    return;
  }

  const filtered = allBunks.filter(bunk =>
    bunk.name.toLowerCase().includes(text)
  );

  if (filtered.length === 0) {
    noResultsMsg.style.display = "block";
    noResultsMsg.textContent = "❌ No EV bunks match your search";
    return;
  }

  noResultsMsg.style.display = "none";
  renderBunks(filtered);
});


/*********************************
 * RECENT SEARCHES (LOCAL STORAGE)
 *********************************/
function saveRecentSearch(text) {
  let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
  searches = searches.filter(s => s !== text);
  searches.unshift(text);
  searches = searches.slice(0, 5);
  localStorage.setItem("recentSearches", JSON.stringify(searches));
}

function loadRecentSearches() {
  recentBox.innerHTML = "";

  const searches = JSON.parse(localStorage.getItem("recentSearches")) || [];

  searches.forEach(text => {
    const div = document.createElement("div");
    div.className = "dropdown-item";
    div.textContent = "🔁 " + text;

    div.onclick = () => {
      searchInput.value = text;
      applyTextSearch(text);
      dropdown.classList.add("hidden");
    };

    recentBox.appendChild(div);
  });
}

function applyTextSearch(text) {
  const filtered = allBunks.filter(bunk =>
    bunk.name.toLowerCase().includes(text.toLowerCase())
  );

  renderBunks(filtered);
}

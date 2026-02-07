/*************************
 * SIMPLE STABLE TUTORIAL
 *************************/

const overlay = document.getElementById("tutorialOverlay");
const highlight = overlay.querySelector(".tutorial-highlight");
const box = overlay.querySelector(".tutorial-box");
const titleEl = document.getElementById("tutorialTitle");
const textEl = document.getElementById("tutorialText");
const nextBtn = document.getElementById("tutorialNext");
const skipBtn = document.getElementById("tutorialSkip");

/* ================= STEPS ================= */

// Guest tutorial
const guestSteps = [
  {
    title: "Welcome to EV Recharge Bunk",
    text: "This quick guide will show you how to use the platform.",
    element: null
  },
  {
    title: "Select Your State",
    text: "Select your state to load EV charging stations.",
    element: "#stateModal"
  },
  {
    title: "EV Bunk List",
    text: "These cards show available EV charging stations.",
    element: ".bunk-card"
  },
  {
    title: "Login Required",
    text: "Please login to book slots and manage bookings.",
    element: "#loginBtn"
  }
];

// Logged-in tutorial
const userSteps = [
  {
    title: "Welcome Back",
    text: "Now let’s understand how bookings work.",
    element: null
  },
  {
    title: "Book a Slot",
    text: "Click on any EV bunk to book a charging slot.",
    element: ".book-btn"
  },
  {
    title: "My Bookings",
    text: "Click on Your on right side top corner, Click My Bookings,View and cancel your bookings there.",
    element: "#myBookingsBtn"
  },
  {
    title: "Tutorial Complete 🎉",
    text: "You now know how to use EV Recharge Bunk.",
    element: null
  }
];

/* ============== STATE ============== */

let activeSteps = [];
let index = 0;

/* ============== HELPERS ============== */

function showOverlay() {
  overlay.classList.remove("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
}

function showStep(i) {
  const step = activeSteps[i];
  if (!step) return;

  showOverlay();

  titleEl.textContent = `Step ${i + 1}`;
  textEl.innerHTML = step.text;

  highlight.style.display = "none";

  if (step.element) {
    const el = document.querySelector(step.element);
    if (el) {
      const rect = el.getBoundingClientRect();

      highlight.style.display = "block";
      highlight.style.top = rect.top - 6 + "px";
      highlight.style.left = rect.left - 6 + "px";
      highlight.style.width = rect.width + 12 + "px";
      highlight.style.height = rect.height + 12 + "px";
    }
  }
}

function endTutorial(type) {
  hideOverlay();

  if (type === "guest") {
    localStorage.setItem("tutorial_guest_done", "true");
  }

  if (type === "user") {
    localStorage.setItem("tutorial_user_done", "true");
  }
}

/* ============== BUTTONS ============== */

nextBtn.onclick = () => {
  index++;

  if (index >= activeSteps.length) {
    endTutorial(activeSteps === userSteps ? "user" : "guest");
  } else {
    showStep(index);
  }
};

skipBtn.onclick = () => {
  endTutorial(activeSteps === userSteps ? "user" : "guest");
};

/* ============== START LOGIC ============== */

// Guest tutorial on page load
window.addEventListener("load", () => {
  if (!localStorage.getItem("tutorial_guest_done")) {
    activeSteps = guestSteps;
    index = 0;
    showStep(index);
  }
});

// Called after login
window.startUserTutorial = function () {
  // prevent guest tutorial from firing again
  localStorage.setItem("tutorial_guest_done", "true");

  if (!localStorage.getItem("tutorial_user_done")) {
    activeSteps = userSteps;
    index = 0;
    showStep(index);
  }
};
document.getElementById("howToUseBtn")?.addEventListener("click", () => {
  window.restartTutorial();
});


// Restart from How To Use
window.restartTutorial = function () {
  localStorage.removeItem("tutorial_guest_done");
  localStorage.removeItem("tutorial_user_done");

  activeSteps = guestSteps;
  index = 0;
  showStep(index);
};

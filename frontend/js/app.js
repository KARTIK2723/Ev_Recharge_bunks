function toggleMenu() {
  document.getElementById("menu").classList.toggle("hidden");
}
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburgerBtn");
  const menu = document.getElementById("menu");

  hamburger.addEventListener("click", () => {
    menu.classList.toggle("hidden");
  });

  // Optional: close when clicking outside
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
      menu.classList.add("hidden");
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const changeStateBtn = document.getElementById("changeStateBtn");
  const stateModal = document.getElementById("stateModal");

  if (changeStateBtn) {
    changeStateBtn.addEventListener("click", () => {
      stateModal.style.display = "flex";
      document.getElementById("menu").classList.add("hidden");
    });
  }
});

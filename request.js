// Controls the Request Support page's welcome-to-overview transition.
document.addEventListener("DOMContentLoaded", () => {
  const stage = document.querySelector(".donate-stage");
  if (!stage) return; // not on the request page

  const screens = {
    welcome: document.getElementById("screen-welcome"),
    info: document.getElementById("screen-info"),
  };

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function showScreen(name) {
    Object.values(screens).forEach((el) => {
      el.classList.remove("active", "show");
    });
    screens[name].classList.add("active");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => screens[name].classList.add("show"));
    });
  }

  // Same timing as the Donate page: let the welcome heart breathe in and out, then reveal.
  const welcomeDelay = prefersReduced ? 200 : 2600;
  setTimeout(() => showScreen("info"), welcomeDelay);
});

// Mock authentication for the EVA site.
// NOTE: there is no backend yet — this uses the browser's localStorage to
// simulate an account. It is NOT secure and does not persist across devices.
// Replace with a real auth provider (e.g. Firebase, Supabase) when EVA has a backend.

document.addEventListener("DOMContentLoaded", () => {
  const authCard = document.querySelector(".auth-card");
  if (!authCard) return; // not on the sign-in page

  const tabs = document.querySelectorAll(".auth-tab");
  const forms = {
    signin: document.getElementById("signin-form"),
    signup: document.getElementById("signup-form"),
  };
  const message = document.getElementById("auth-message");

  function showMessage(text) {
    message.textContent = text;
    message.hidden = false;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      Object.values(forms).forEach((f) => f.classList.remove("active"));
      forms[tab.dataset.tab].classList.add("active");
      message.hidden = true;
    });
  });

  // Role selector on the Create Account form
  let selectedRole = "Donor";
  document.querySelectorAll(".auth-role-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".auth-role-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      selectedRole = chip.dataset.role;
    });
  });

  // --- Sign In ---
  forms.signin.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = forms.signin.querySelector('input[type="email"]').value.trim().toLowerCase();
    const stored = JSON.parse(localStorage.getItem("eva_user") || "null");

    if (stored && stored.email === email) {
      localStorage.setItem("eva_session", JSON.stringify(stored));
      window.location.href = "index.html";
    } else {
      showMessage("We couldn't find an account with that email. Try Create Account instead.");
    }
  });

  // --- Create Account ---
  forms.signup.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = forms.signup.querySelector('input[type="text"]').value.trim();
    const email = forms.signup.querySelector('input[type="email"]').value.trim().toLowerCase();
    const passwordFields = forms.signup.querySelectorAll('input[type="password"]');
    const password = passwordFields[0].value;
    const confirmPassword = passwordFields[1].value;

    if (password !== confirmPassword) {
      showMessage("Passwords don't match — please try again.");
      return;
    }

    const user = { name, email, role: selectedRole };
    localStorage.setItem("eva_user", JSON.stringify(user));
    localStorage.setItem("eva_session", JSON.stringify(user));
    window.location.href = "index.html";
  });
});

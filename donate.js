// Controls the Donate page's step-by-step flow.
document.addEventListener("DOMContentLoaded", () => {
  const stage = document.querySelector(".donate-stage");
  if (!stage) return; // not on the donate page

  const screens = {
    welcome: document.getElementById("screen-welcome"),
    choice: document.getElementById("screen-choice"),
    family: document.getElementById("screen-family"),
    explainer: document.getElementById("screen-explainer"),
    confirm: document.getElementById("screen-confirm"),
  };

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let current = "welcome";
  let cameFrom = "choice"; // where "Back" from the explainer screen should go

  function showScreen(name) {
    Object.values(screens).forEach((el) => {
      el.classList.remove("active", "show");
    });
    screens[name].classList.add("active");
    // trigger the fade-in on the next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => screens[name].classList.add("show"));
    });
    current = name;
  }

  // --- Step 1: welcome heart, then reveal the choice screen ---
  const welcomeDelay = prefersReduced ? 200 : 2600;
  setTimeout(() => showScreen("choice"), welcomeDelay);

  // --- Step 2: choice cards ---
  const copy = {
    urgent: {
      eyebrow: "Donate where it's needed most",
      title: "Your gift goes where it matters most today.",
      text: "When you give this way, EVA receives your gift and shares it with the families whose needs are most urgent right now, keeping a small share to help EVA keep running.",
      amounts: [10, 25, 50, 100],
      ctaLabel: (amt) => `Give $${amt} Where It's Needed Most`,
      confirmTitle: "Thank you.",
      confirmText: (amt) =>
        `Your $${amt} gift is on its way to the families who need it most right now.`,
    },
    monthly: {
      eyebrow: "Become a monthly donor",
      title: "A little, every month, adds up to a lot.",
      text: "As a monthly donor, EVA will share your gift with the families who need it most, automatically, every month. You can change or cancel anytime.",
      amounts: [5, 15, 30, 50],
      ctaLabel: (amt) => `Start Monthly Giving — $${amt}/mo`,
      confirmTitle: "Welcome aboard.",
      confirmText: (amt) =>
        `You're now a monthly donor at $${amt}/mo. EVA will share it where it's needed most, every month.`,
    },
    grow: {
      eyebrow: "Help EVA grow",
      title: "Some gifts go to the organization itself.",
      text: "Choosing this sends your gift straight to EVA, helping us reach more families, verify more stories, and keep the platform running.",
      amounts: [10, 25, 50, 100],
      ctaLabel: (amt) => `Send $${amt} to EVA`,
      confirmTitle: "Thank you for helping EVA grow.",
      confirmText: (amt) => `Your $${amt} gift goes straight to the organization.`,
    },
  };

  let selectedFamily = null;

  document.querySelectorAll(".choice-card").forEach((card) => {
    card.addEventListener("click", () => {
      const flow = card.dataset.flow;
      if (flow === "family") {
        cameFrom = "choice";
        showScreen("family");
      } else {
        cameFrom = "choice";
        openExplainer(flow);
      }
    });
  });

  // --- Step 3a: pick a specific family ---
  document.querySelectorAll(".donate-give-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedFamily = btn.dataset.family;
      cameFrom = "family";
      openExplainer("family");
    });
  });

  // --- Step 3b: explainer + amount screen (shared by all flows) ---
  const explainerEyebrow = document.getElementById("explainer-eyebrow");
  const explainerTitle = document.getElementById("explainer-title");
  const explainerText = document.getElementById("explainer-text");
  const amountGrid = document.getElementById("amount-grid");
  const customInputWrap = document.getElementById("amount-custom-input");
  const customInput = document.getElementById("amount-custom-value");
  const ctaBtn = document.getElementById("donate-cta-btn");

  let activeFlow = null;
  let selectedAmount = null;

  function openExplainer(flow) {
    activeFlow = flow;
    selectedAmount = null;
    customInputWrap.classList.remove("show");
    customInput.value = "";

    if (flow === "family") {
      const familyName = selectedFamily || "family you chose";
      explainerEyebrow.textContent = "Support a specific family";
      explainerTitle.textContent = `Your gift goes straight to ${familyName}.`;
      explainerText.textContent = `100% of what you give here goes directly to ${familyName}, helping with exactly what they've asked for.`;
      buildAmountChips([10, 25, 50, 100]);
      updateCta();
    } else {
      const c = copy[flow];
      explainerEyebrow.textContent = c.eyebrow;
      explainerTitle.textContent = c.title;
      explainerText.textContent = c.text;
      buildAmountChips(c.amounts);
      updateCta();
    }

    showScreen("explainer");
  }

  function buildAmountChips(amounts) {
    amountGrid.innerHTML = "";
    amounts.forEach((amt) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "amount-chip";
      chip.textContent = `$${amt}`;
      chip.dataset.amount = amt;
      chip.addEventListener("click", () => selectAmount(amt, chip));
      amountGrid.appendChild(chip);
    });
    const customChip = document.createElement("button");
    customChip.type = "button";
    customChip.className = "amount-chip";
    customChip.textContent = "Custom";
    customChip.dataset.amount = "custom";
    customChip.addEventListener("click", () => {
      customInputWrap.classList.add("show");
      setActiveChip(customChip);
      selectedAmount = parseFloat(customInput.value) || null;
      updateCta();
      customInput.focus();
    });
    amountGrid.appendChild(customChip);
  }

  function setActiveChip(activeEl) {
    amountGrid.querySelectorAll(".amount-chip").forEach((c) => c.classList.remove("active"));
    activeEl.classList.add("active");
  }

  function selectAmount(amt, chip) {
    selectedAmount = amt;
    customInputWrap.classList.remove("show");
    setActiveChip(chip);
    updateCta();
  }

  customInput.addEventListener("input", () => {
    const val = parseFloat(customInput.value);
    selectedAmount = val > 0 ? val : null;
    updateCta();
  });

  function updateCta() {
    if (!selectedAmount || selectedAmount <= 0) {
      ctaBtn.disabled = true;
      ctaBtn.textContent =
        activeFlow === "family" ? "Choose an amount" : "Choose an amount to continue";
      return;
    }
    ctaBtn.disabled = false;
    if (activeFlow === "family") {
      ctaBtn.textContent = `Give $${selectedAmount} to ${selectedFamily}`;
    } else {
      ctaBtn.textContent = copy[activeFlow].ctaLabel(selectedAmount);
    }
  }

  ctaBtn.addEventListener("click", () => {
    if (!selectedAmount) return;
    showConfirmation();
  });

  // --- Step 4: thank-you screen ---
  const confirmTitle = document.getElementById("confirm-title");
  const confirmText = document.getElementById("confirm-text");

  function showConfirmation() {
    if (activeFlow === "family") {
      confirmTitle.textContent = "Thank you.";
      confirmText.textContent = `Your $${selectedAmount} gift goes straight to ${selectedFamily}.`;
    } else {
      const c = copy[activeFlow];
      confirmTitle.textContent = c.confirmTitle;
      confirmText.textContent = c.confirmText(selectedAmount);
    }
    showScreen("confirm");
  }

  // --- Back buttons ---
  document.querySelectorAll(".donate-back").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.back === "explainer-origin") {
        showScreen(cameFrom);
      } else {
        showScreen(btn.dataset.back);
      }
    });
  });
});

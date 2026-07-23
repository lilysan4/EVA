// Homepage opening animation: fade out the intro overlay once the heart has breathed in and out.
const siteIntro = document.getElementById("site-intro");

if (siteIntro) {
  const prefersReducedIntro = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const introDelay = prefersReducedIntro ? 0 : 2600;

  setTimeout(() => {
    siteIntro.classList.add("hide");
    siteIntro.addEventListener(
      "transitionend",
      () => siteIntro.classList.add("remove"),
      { once: true }
    );
    // Fallback in case transitionend doesn't fire (e.g. reduced motion, no opacity change)
    setTimeout(() => siteIntro.classList.add("remove"), 700);
  }, introDelay);
}

// Revela seções conforme o usuário rola a página.
const revealEls = document.querySelectorAll(".reveal, .story-text");

if (revealEls.length) {
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          obs.unobserve(entry.target); // anima uma vez só
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
}

// Anima os contadores das estatísticas quando entram na tela.
const counters = document.querySelectorAll(".stat-number");

if (counters.length) {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const runCount = (el) => {
    const target = parseInt(el.dataset.target || "0", 10);

    if (prefersReduced) {
      el.textContent = target;
      return;
    }

    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic para desacelerar no fim
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          runCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => countObserver.observe(el));
}

// Menu hambúrguer (mobile)
const menuBtn = document.querySelector(".mobile-menu-btn");
const navCenter = document.querySelector(".nav-center");

if (menuBtn && navCenter) {
  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("open");
    navCenter.classList.toggle("mobile-open");
  });

  // fecha o menu ao clicar em um link
  navCenter.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menuBtn.classList.remove("open");
      navCenter.classList.remove("mobile-open");
    });
  });
}

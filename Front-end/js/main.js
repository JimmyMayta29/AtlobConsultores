document.addEventListener("DOMContentLoaded", () => {

  /* ================================================
     REVEAL SYSTEM — IntersectionObserver with stagger
     ================================================ */
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Stagger delay for siblings in same parent
            const delay = Array.from(entry.target.parentElement?.children || [])
              .filter(el => el.classList.contains("reveal"))
              .indexOf(entry.target) * 80;

            setTimeout(() => {
              entry.target.classList.add("active");
            }, Math.min(delay, 400));

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback for older browsers
    const activateRevealByScroll = () => {
      revealElements.forEach((element) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - 100) {
          element.classList.add("active");
        }
      });
    };
    activateRevealByScroll();
    window.addEventListener("scroll", activateRevealByScroll, { passive: true });
  }

  /* ================================================
     HAMBURGER MENU
     ================================================ */
  document.addEventListener("click", (event) => {
    const toggle = event.target.closest(".menu-toggle");
    if (!toggle) return;

    const isActive = toggle.classList.toggle("active");
    toggle.setAttribute("aria-expanded", isActive);

    const navMenu = document.querySelector(".nav-center");
    const navRight = document.querySelector(".nav-right");

    if (navMenu) navMenu.classList.toggle("active");
    if (navRight) navRight.classList.toggle("active");
  });

  // Close menu when clicking a nav link
  document.addEventListener("click", (event) => {
    const link = event.target.closest(".nav-center a");
    if (!link) return;

    const toggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-center");
    const navRight = document.querySelector(".nav-right");

    if (toggle && toggle.classList.contains("active")) {
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      if (navMenu) navMenu.classList.remove("active");
      if (navRight) navRight.classList.remove("active");
    }
  });

  /* ================================================
     SCROLL PROGRESS BAR
     ================================================ */
  const scrollProgress = document.getElementById("scrollProgress");
  if (scrollProgress) {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = progress + "%";
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  /* ================================================
     ANIMATED COUNTERS — Stats section (Basel-style & Corporate KPI)
     ================================================ */
  const statNumbers = document.querySelectorAll(".stat-number, .stat-counter-value");

  if (statNumbers.length && "IntersectionObserver" in window) {
    const animateCounter = (el) => {
      const targetAttr = el.getAttribute("data-target") || el.getAttribute("data-count");
      const target = parseFloat(targetAttr) || 0;
      const isOrdinal = el.classList.contains("ordinal");
      const prefix = el.getAttribute("data-prefix") || "";
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1800;
      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        if (isOrdinal) {
          el.textContent = current + "er";
        } else if (prefix || suffix) {
          el.textContent = prefix + current.toLocaleString('es-PE') + suffix;
        } else if (target >= 10 && !el.classList.contains("stat-counter-value")) {
          el.textContent = current + "+";
        } else {
          el.textContent = current.toLocaleString('es-PE');
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      requestAnimationFrame(step);
    };

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    statNumbers.forEach((el) => counterObserver.observe(el));
  }

  /* ================================================
     SMOOTH SCROLL for anchor links
     ================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (targetId === "#") return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ================================================
     SERVICES ACCORDION INTERACTION (Bloque 1)
     ================================================ */
  const accordionPanels = document.querySelectorAll(".service-accordion-panel");
  if (accordionPanels.length) {
    const activatePanel = (panel) => {
      accordionPanels.forEach((p) => p.classList.remove("is-active"));
      panel.classList.add("is-active");
    };

    accordionPanels.forEach((panel) => {
      panel.addEventListener("mouseenter", () => activatePanel(panel));
      panel.addEventListener("focus", () => activatePanel(panel));
      panel.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activatePanel(panel);
        }
      });
    });
  }
});

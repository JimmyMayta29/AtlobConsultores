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
  const statNumbers = document.querySelectorAll(".stat-number[data-target], .stat-number[data-count], .stat-counter-value[data-target], .stat-counter-value[data-count]");

  if (statNumbers.length && "IntersectionObserver" in window) {
    const animateCounter = (el) => {
      const targetAttr = el.getAttribute("data-target") || el.getAttribute("data-count");
      const target = Number(targetAttr);
      if (!Number.isFinite(target)) return;
      const isOrdinal = el.classList.contains("ordinal");
      const prefix = el.getAttribute("data-prefix") || "";
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1800;
      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        const progress = duration ? Math.min(elapsed / duration, 1) : 1;
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
     SERVICES ACCORDION INTERACTION (Bloque 1)
     ================================================ */
  const accordionPanels = document.querySelectorAll(".service-accordion-panel");
  if (accordionPanels.length) {
    const activatePanel = (panel) => {
      accordionPanels.forEach((p) => p.classList.remove("is-active"));
      panel.classList.add("is-active");
    };

    accordionPanels.forEach((panel) => {
      panel.addEventListener("mouseenter", () => {
        if (window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
            !panel.parentElement.contains(document.activeElement)) activatePanel(panel);
      });
      panel.addEventListener("focusin", () => activatePanel(panel));
      panel.addEventListener("click", () => activatePanel(panel));
      panel.addEventListener("keydown", (e) => {
        if (e.target !== panel) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activatePanel(panel);
        }
        const index = Array.from(accordionPanels).indexOf(panel);
        const next = { ArrowRight: (index + 1) % accordionPanels.length,
          ArrowLeft: (index + accordionPanels.length - 1) % accordionPanels.length,
          Home: 0, End: accordionPanels.length - 1 }[e.key];
        if (next !== undefined) {
          e.preventDefault();
          accordionPanels[next].focus();
        }
      });
    });
  }
});

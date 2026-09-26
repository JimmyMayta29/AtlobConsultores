/* ═══════════════════════════════════════════════
   MAIN JS — Apple-Inspired Interactive Systems
   ═══════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {

  /* ================================================
     1. REVEAL SYSTEM — Apple Spring Entrance
     ================================================ */
  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const parent = entry.target.parentElement;
            const siblings = Array.from(parent?.children || []).filter(el => el.classList.contains("reveal"));
            const index = siblings.indexOf(entry.target);
            const delay = Math.min(index * 70, 350);

            setTimeout(() => {
              entry.target.classList.add("active");
            }, delay);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback
    revealElements.forEach((el) => el.classList.add("active"));
  }

  /* ================================================
     2. APPLE SPOTLIGHT EFFECT ON BENTO CARDS
     ================================================ */
  const spotlightCards = document.querySelectorAll(".bento-card-spotlight");

  spotlightCards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });

  /* ================================================
     3. CINEMATIC CAROUSEL (DRAG & TOUCH WITH INERTIA)
     ================================================ */
  const scroller = document.getElementById("innovation-scroller");
  const dots = document.querySelectorAll(".cinema-dot");

  if (scroller) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let isDragging = false;

    // Mouse drag
    scroller.addEventListener("mousedown", (e) => {
      isDown = true;
      isDragging = false;
      scroller.classList.add("active");
      startX = e.pageX - scroller.offsetLeft;
      scrollLeft = scroller.scrollLeft;
    });

    document.addEventListener("mouseup", () => {
      if (!isDown) return;
      isDown = false;
      scroller.classList.remove("active");
      setTimeout(() => { isDragging = false; }, 50);
    });

    scroller.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      isDragging = true;
      const x = e.pageX - scroller.offsetLeft;
      const walk = (x - startX) * 1.8;
      scroller.scrollLeft = scrollLeft - walk;
    });

    // Prevent link clicks during drag
    scroller.addEventListener("click", (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    // Sync active dots with scroll position
    const updateDots = () => {
      const cardWidth = scroller.querySelector(".cinema-card")?.offsetWidth || 350;
      const gap = 24;
      const index = Math.round(scroller.scrollLeft / (cardWidth + gap));

      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    };

    scroller.addEventListener("scroll", updateDots, { passive: true });

    // Click dot to scroll to card
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const index = parseInt(dot.getAttribute("data-index"), 10);
        const cardWidth = scroller.querySelector(".cinema-card")?.offsetWidth || 350;
        const gap = 24;
        scroller.scrollTo({
          left: index * (cardWidth + gap),
          behavior: "smooth"
        });
      });
    });
  }

  /* ================================================
     4. ANIMATED COUNTERS (APPLE EASE PHYSICS)
     ================================================ */
  const statNumbers = document.querySelectorAll(".stat-number[data-count]");

  if (statNumbers.length && "IntersectionObserver" in window) {
    const animateCounter = (el) => {
      const countAttr = el.getAttribute("data-count");
      if (!countAttr) return;
      const target = parseInt(countAttr, 10);
      if (isNaN(target)) return;

      const isOrdinal = el.classList.contains("ordinal");
      const duration = 1600;
      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Spring ease out
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = Math.round(eased * target);

        if (isOrdinal) {
          el.textContent = current + "er";
        } else if (target >= 10) {
          el.textContent = current + "+";
        } else {
          el.textContent = current;
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
      { threshold: 0.4 }
    );

    statNumbers.forEach((el) => counterObserver.observe(el));
  }

  /* ================================================
     5. HAMBURGER MENU (RESPONSIVE)
     ================================================ */
  document.addEventListener("click", (event) => {
    const toggle = event.target.closest(".menu-toggle");
    if (!toggle) return;

    const isActive = toggle.classList.toggle("active");
    toggle.setAttribute("aria-expanded", isActive);

    const navMenu = document.querySelector(".nav-center");
    if (navMenu) navMenu.classList.toggle("active");
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest(".nav-center a");
    if (!link) return;

    const toggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-center");

    if (toggle && toggle.classList.contains("active")) {
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      if (navMenu) navMenu.classList.remove("active");
    }
  });

  /* ================================================
     6. SCROLL PROGRESS BAR
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
     7. SMOOTH SCROLL FOR INTERNAL LINKS
     ================================================ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
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

});

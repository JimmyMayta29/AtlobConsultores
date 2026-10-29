const layoutBaseUrl = new URL("../", document.currentScript.src);

document.addEventListener("DOMContentLoaded", () => {

  /* ================================================
     LOAD COMPONENTS (Header + Footer)
     ================================================ */
  const loadComponent = async (id, file) => {
    const element = document.getElementById(id);
    if (!element) return;

    try {
      const response = await fetch(file);
      if (!response.ok) {
        console.warn(`Component ${file} returned ${response.status}`);
        return;
      }
      const data = await response.text();
      element.innerHTML = data;

      // Component links are relative to the site, regardless of article depth.
      element.querySelectorAll("a[href]").forEach(link => {
        const href = link.getAttribute("href");
        if (!href || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)) return;
        link.href = new URL(href.replace(/^\/+/, ""), layoutBaseUrl).href;
      });
    } catch (error) {
      console.error(`Failed to load ${file}:`, error);
    }
  };

  // Load header and footer, then inject WhatsApp button
  Promise.all([
    loadComponent("header-container", new URL("Components/header.html", layoutBaseUrl)),
    loadComponent("footer-container", new URL("Components/footer.html", layoutBaseUrl))
  ]).then(() => {
    // Inject global WhatsApp floating button if not already present
    if (!document.querySelector(".whatsapp-float")) {
      const wa = document.createElement("a");
      wa.href = "https://wa.me/51940781298";
      wa.className = "whatsapp-float";
      wa.target = "_blank";
      wa.rel = "noopener noreferrer";
      wa.setAttribute("aria-label", "Contactar por WhatsApp");
      wa.innerHTML = '<i class="fab fa-whatsapp"></i>';
      document.body.appendChild(wa);
    }



    updateCurrentNavigation();
    initNavigationMenu();

    // Auto-initialize article reading progress if on an article page
    if (document.querySelector('.article-view') && typeof window.initArticleReadingProgress === 'function') {
      window.initArticleReadingProgress();
    }

    // Initialize Newsletter subscription form
    initNewsletterForm();
  });

  function updateCurrentNavigation() {
    const normalizePath = path => path.replace(/index\.html$/, "").replace(/\/$/, "");
    const currentPath = normalizePath(window.location.pathname);
    const magazinePath = normalizePath(new URL("revista/", layoutBaseUrl).pathname);
    document.querySelectorAll(".nav-center a").forEach(link => {
      const url = new URL(link.href);
      const linkPath = normalizePath(url.pathname);
      const samePage = currentPath === linkPath;
      const isMagazine = linkPath === magazinePath && currentPath.startsWith(magazinePath + "/");
      const isActive = url.hash ? samePage && url.hash === window.location.hash : samePage || isMagazine;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", url.hash || isMagazine ? "location" : "page");
      else link.removeAttribute("aria-current");
    });
  }

  window.addEventListener("hashchange", updateCurrentNavigation);

  function initNavigationMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".nav-center");
    const actions = document.querySelector(".nav-right");
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      toggle.classList.toggle("active", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú de navegación" : "Abrir menú de navegación");
      menu.classList.toggle("active", open);
      actions?.classList.toggle("active", open);
    };

    toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("click", (event) => {
      if (event.target.closest(".nav-center a, .nav-right a") || !event.target.closest(".header")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        event.preventDefault();
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia("(max-width: 1080px)").addEventListener("change", (event) => {
      if (!event.matches) setOpen(false);
    });
  }

  function initNewsletterForm() {
    const form = document.getElementById("newsletter-form");
    if (!form) return;
    if (form.dataset.initialized === "true") return;
    form.dataset.initialized = "true";

    const emailInput = document.getElementById("newsletter-email");
    const feedbackEl = document.getElementById("newsletter-feedback");
    const submitBtn = document.getElementById("newsletter-submit-btn");

    const showFeedback = (type, message) => {
      if (!feedbackEl) return;
      feedbackEl.className = `newsletter-feedback ${type}`;
      feedbackEl.textContent = message;
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = emailInput ? emailInput.value.trim() : "";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email) {
        showFeedback("error", "Por favor ingresa tu correo electrónico.");
        if (emailInput) emailInput.focus();
        return;
      }

      if (!emailRegex.test(email)) {
        showFeedback("error", "Por favor ingresa un correo electrónico válido.");
        if (emailInput) emailInput.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Enviando...</span> <i class="fas fa-spinner fa-spin"></i>`;
      }
      showFeedback("info", "Procesando suscripción...");

      try {
        const response = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source: "footer_form" })
        });
        const data = await response.json();

        if (response.ok && data.success) {
          showFeedback("success", data.message || "¡Gracias por suscribirte al boletín!");
          if (emailInput) emailInput.value = "";
        } else {
          showFeedback("error", data.message || "No se pudo procesar la suscripción.");
        }
      } catch (err) {
        console.error("Error en suscripción:", err);
        showFeedback("error", "Error de conexión. Por favor intente más tarde.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Suscribirme</span> <i class="fas fa-paper-plane"></i>`;
        }
      }
    });
  }

});

/* ================================================
   HEADER SCROLL EFFECT
   ================================================ */
window.addEventListener("scroll", function () {
  const header = document.querySelector(".header");
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 30);
}, { passive: true });

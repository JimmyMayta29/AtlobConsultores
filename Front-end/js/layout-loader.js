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

      // Fix links if in a subfolder
      const isInSubfolder = window.location.pathname.toLowerCase().includes('/revista/') || 
                            window.location.pathname.toLowerCase().includes('/servicios/') || 
                            window.location.pathname.toLowerCase().includes('/gestor_revista/');
      if (isInSubfolder) {
        element.querySelectorAll('a').forEach(link => {
          const href = link.getAttribute('href');
          if (href && (href.startsWith('./') || href.startsWith('/'))) {
            const newHref = '../' + href.replace(/^[\.\/]+/, '');
            link.setAttribute('href', newHref);
          } else if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            if (!href.startsWith('../')) {
              link.setAttribute('href', '../' + href);
            }
          }
        });
      }
    } catch (error) {
      console.error(`Failed to load ${file}:`, error);
    }
  };

  // Calculate base path for components
  const isInSubfolder = window.location.pathname.toLowerCase().includes('/revista/') || 
                        window.location.pathname.toLowerCase().includes('/servicios/') || 
                        window.location.pathname.toLowerCase().includes('/gestor_revista/');
  const basePath = isInSubfolder ? "../" : "./";

  // Load header and footer, then inject WhatsApp button
  Promise.all([
    loadComponent("header-container", `${basePath}components/header.html`),
    loadComponent("footer-container", `${basePath}components/footer.html`)
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



    // Highlight current page in navigation
    const currentPath = window.location.pathname;
    document.querySelectorAll(".nav-center a").forEach(link => {
      const linkPath = new URL(link.href, window.location.origin).pathname;
      if (currentPath === linkPath || 
          (currentPath.endsWith("/") && linkPath.includes("index.html"))) {
        link.style.color = "var(--amarillo-acento)";
        link.style.fontWeight = "600";
      }
    });

    // Initialize Newsletter subscription form
    initNewsletterForm();
  });

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

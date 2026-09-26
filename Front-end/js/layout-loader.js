document.addEventListener("DOMContentLoaded", () => {

  /* ================================================
     CALCULATE BASE PATH FOR COMPONENTS & ASSETS
     ================================================ */
  const getBasePath = () => {
    const scriptTag = document.querySelector('script[src*="layout-loader.js"]');
    if (scriptTag) {
      const src = scriptTag.getAttribute('src');
      const match = src.match(/^(?:\.\.\/|\.\/)+/);
      if (match) return match[0];
    }
    const path = window.location.pathname.toLowerCase().replace(/\\/g, '/');
    if (path.includes('/revista/posts/')) return '../../';
    if (path.includes('/revista/') || path.includes('/gestor_revista/')) return '../';
    return './';
  };

  const basePath = getBasePath();

  /* ================================================
     FALLBACK TEMPLATES (FOR OFFLINE / FILE:// PROTOCOL)
     ================================================ */
  const getHeaderTemplate = (base) => `
    <header class="header" role="navigation" aria-label="Navegación principal">
      <nav class="navbar apple-nav">
        <div class="nav-left">
          <a href="${base}index.html" class="logo" aria-label="Inicio — Consultoría ATLOB">
            <span class="logo-text">ATLOB</span>
            <span class="logo-tag">CONSULTORES</span>
          </a>
        </div>

        <button class="menu-toggle" aria-label="Abrir menú de navegación" aria-expanded="false">
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <ul class="nav-center">
          <li><a href="${base}index.html" class="nav-link">Inicio</a></li>
          <li><a href="${base}nosotros.html" class="nav-link">Nosotros</a></li>
          <li><a href="${base}servicios.html" class="nav-link">Servicios</a></li>
          <li><a href="${base}revista/index.html" class="nav-link">Revista ATLOB</a></li>
        </ul>

        <div class="nav-right">
          <a href="${base}contacto.html" class="btn-contacto btn-pill-apple">
            <span>Contáctanos</span>
            <i class="fas fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </nav>
    </header>
  `;

  const getFooterTemplate = (base) => `
    <footer class="footer" role="contentinfo">
      <div class="container footer-grid">
        <div class="footer-brand">
          <h3 style="font-weight: 800; letter-spacing: -0.02em;">Consultoría ATLOB</h3>
          <p>Soluciones contables, auditoría y asesoría tributaria estratégica con tecnología de vanguardia.</p>
          <div class="footer-contact">
            <p><strong>Ubicación:</strong> Calle Mateo Pumacahua 355, Óvalo de Cormis — Jauja</p>
            <p><strong>Email:</strong> consultoriaatlob@gmail.com</p>
            <p><strong>Teléfono:</strong> +51 940 781 298</p>
          </div>
          <div class="footer-social" style="margin-top: 14px;">
            <a href="https://wa.me/51940781298" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">WhatsApp</a>
            <a href="#" aria-label="Facebook">Facebook</a>
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="LinkedIn">LinkedIn</a>
          </div>
        </div>

        <div>
          <h4>Servicios</h4>
          <ul>
            <li><a href="${base}servicios.html">Outsourcing Contable</a></li>
            <li><a href="${base}servicios.html">Asesoría Tributaria</a></li>
            <li><a href="${base}servicios.html">Gestión Laboral</a></li>
            <li><a href="${base}servicios.html">Auditoría Financiera</a></li>
          </ul>
        </div>

        <div>
          <h4>Revista ATLOB</h4>
          <ul>
            <li><a href="${base}revista/index.html">Publicaciones</a></li>
            <li><a href="${base}revista/tributario.html">Normativa Tributaria</a></li>
            <li><a href="${base}revista/contabilidad.html">Casos Prácticos</a></li>
            <li><a href="${base}revista/auditoria.html">Auditoría y NIIF</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        &copy; 2026 Consultoría ATLOB. Todos los derechos reservados.
      </div>
    </footer>
  `;

  /* ================================================
     LOAD COMPONENTS (Header + Footer)
     ================================================ */
  const loadComponent = async (id, fileVariants, fallbackHtml) => {
    const element = document.getElementById(id);
    if (!element) return;

    for (const file of fileVariants) {
      try {
        const response = await fetch(file);
        if (response.ok) {
          const data = await response.text();
          element.innerHTML = data;

          if (basePath !== './') {
            element.querySelectorAll('a').forEach(link => {
              const href = link.getAttribute('href');
              if (!href || href.startsWith('#') || href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
              }
              const cleanHref = href.replace(/^(\.\/|\/)/, '');
              link.setAttribute('href', basePath + cleanHref);
            });
          }
          return;
        }
      } catch (error) {
        // Continue to fallback
      }
    }

    // Use Fallback if fetch was blocked (e.g. file:// protocol)
    if (fallbackHtml) {
      element.innerHTML = fallbackHtml;
    }
  };

  // Load header and footer, then inject WhatsApp button and highlight current page
  Promise.all([
    loadComponent("header-container", [
      `${basePath}Components/header.html`,
      `${basePath}components/header.html`
    ], getHeaderTemplate(basePath)),
    loadComponent("footer-container", [
      `${basePath}Components/footer.html`,
      `${basePath}components/footer.html`
    ], getFooterTemplate(basePath))
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
    const currentPath = window.location.pathname.toLowerCase().replace(/\\/g, '/');
    document.querySelectorAll(".nav-center a").forEach(link => {
      const linkHref = (link.getAttribute("href") || "").toLowerCase().replace(/\\/g, '/');
      const filename = currentPath.split('/').pop() || 'index.html';
      
      if (linkHref.includes(filename) && filename !== '') {
        link.classList.add('active');
      } else if (currentPath.includes('/revista/') && linkHref.includes('revista')) {
        link.classList.add('active');
      }
    });
  });

});

/* ================================================
   HEADER SCROLL EFFECT
   ================================================ */
window.addEventListener("scroll", function () {
  const header = document.querySelector(".header");
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 25);
}, { passive: true });

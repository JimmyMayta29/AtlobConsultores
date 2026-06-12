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
  });

});

/* ================================================
   HEADER SCROLL EFFECT
   ================================================ */
window.addEventListener("scroll", function () {
  const header = document.querySelector(".header");
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 30);
}, { passive: true });

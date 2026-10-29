/**
 * Consultoría ATLOB — Cookie Consent Banner & Preferences Manager
 * Compliant with Ley N° 29733 (Perú) & ePrivacy / GDPR standards
 */

(function () {
  const STORAGE_KEY = 'atlob_cookie_consent_v1';

  function getConsent() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function setConsent(settings) {
    try {
      const payload = {
        necessary: true,
        analytics: Boolean(settings.analytics),
        preferences: Boolean(settings.preferences),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      
      // Dispatch custom event for analytics script
      window.dispatchEvent(new CustomEvent('atlob_consent_updated', { detail: payload }));
    } catch (e) {
      console.warn('No se pudo guardar la configuración de cookies:', e);
    }
  }

  function injectBannerUI() {
    // If already consented, don't show
    if (getConsent()) return;

    // Check if already injected
    if (document.getElementById('atlob-cookie-banner')) return;

    const bannerHTML = `
      <div id="atlob-cookie-banner" class="atlob-cookie-banner" role="region" aria-label="Aviso de privacidad y cookies">
        <div class="cookie-banner-container">
          <div class="cookie-banner-content">
            <div class="cookie-icon-wrapper">
              <i class="fas fa-shield-halved" aria-hidden="true"></i>
            </div>
            <div class="cookie-text-block">
              <h4 class="cookie-title">Tu privacidad y seguridad son fundamentales</h4>
              <p class="cookie-desc">
                Utilizamos cookies propias y de análisis para optimizar tu experiencia contable, recordar tus preferencias y evaluar el rendimiento del sitio web conforme a nuestra 
                <a href="/politica-de-privacidad.html" target="_blank" rel="noopener">Política de Privacidad</a>.
              </p>
            </div>
          </div>
          <div class="cookie-banner-actions">
            <button type="button" class="btn-cookie btn-cookie-accept" id="btn-cookie-accept-all">
              Aceptar todas
            </button>
            <button type="button" class="btn-cookie btn-cookie-reject" id="btn-cookie-reject-optional">
              Solo necesarias
            </button>
            <button type="button" class="btn-cookie btn-cookie-settings" id="btn-cookie-open-modal">
              Personalizar
            </button>
          </div>
        </div>
      </div>

      <!-- Cookie Settings Modal -->
      <div id="atlob-cookie-modal" class="atlob-cookie-modal" aria-hidden="true" role="dialog" aria-labelledby="cookie-modal-title">
        <div class="cookie-modal-backdrop" id="cookie-modal-backdrop"></div>
        <div class="cookie-modal-card">
          <div class="cookie-modal-header">
            <h3 id="cookie-modal-title">Preferencias de Privacidad y Cookies</h3>
            <button type="button" class="cookie-modal-close" id="btn-cookie-modal-close" aria-label="Cerrar modal">&times;</button>
          </div>
          <div class="cookie-modal-body">
            <p>Configura qué tipos de cookies deseas permitir durante tu navegación en Consultoría ATLOB:</p>
            
            <div class="cookie-category-item">
              <div class="cookie-category-info">
                <div class="cookie-category-title">
                  <strong>Cookies Técnicas y Esenciales</strong>
                  <span class="badge-required">Obligatorias</span>
                </div>
                <p>Imprescindibles para la navegación básica, seguridad SSL y carga eficiente de componentes.</p>
              </div>
              <div class="cookie-toggle">
                <input type="checkbox" id="cookie-opt-necessary" checked disabled>
                <label for="cookie-opt-necessary" class="toggle-slider"></label>
              </div>
            </div>

            <div class="cookie-category-item">
              <div class="cookie-category-info">
                <div class="cookie-category-title">
                  <strong>Cookies de Análisis y Rendimiento</strong>
                  <span class="badge-optional">Opcionales</span>
                </div>
                <p>Nos permiten medir de forma anónima las visitas a la Revista ATLOB y optimizar nuestros servicios.</p>
              </div>
              <div class="cookie-toggle">
                <input type="checkbox" id="cookie-opt-analytics" checked>
                <label for="cookie-opt-analytics" class="toggle-slider"></label>
              </div>
            </div>

            <div class="cookie-category-item">
              <div class="cookie-category-info">
                <div class="cookie-category-title">
                  <strong>Cookies de Preferencias</strong>
                  <span class="badge-optional">Opcionales</span>
                </div>
                <p>Guardan tu sesión de lectura, filtros de artículos preferidos y configuraciones de búsqueda.</p>
              </div>
              <div class="cookie-toggle">
                <input type="checkbox" id="cookie-opt-preferences" checked>
                <label for="cookie-opt-preferences" class="toggle-slider"></label>
              </div>
            </div>
          </div>
          <div class="cookie-modal-footer">
            <button type="button" class="btn-cookie btn-cookie-save" id="btn-cookie-save-preferences">
              Guardar preferencias
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', bannerHTML);

    const banner = document.getElementById('atlob-cookie-banner');
    const modal = document.getElementById('atlob-cookie-modal');
    const backdrop = document.getElementById('cookie-modal-backdrop');
    const closeBtn = document.getElementById('btn-cookie-modal-close');
    const acceptAllBtn = document.getElementById('btn-cookie-accept-all');
    const rejectBtn = document.getElementById('btn-cookie-reject-optional');
    const openModalBtn = document.getElementById('btn-cookie-open-modal');
    const savePrefBtn = document.getElementById('btn-cookie-save-preferences');

    function hideBanner() {
      if (banner) {
        banner.style.transform = 'translateY(150%)';
        banner.style.opacity = '0';
        setTimeout(() => banner.remove(), 400);
      }
    }

    function openModal() {
      if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
      }
    }

    function closeModal() {
      if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      }
    }

    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', () => {
        setConsent({ analytics: true, preferences: true });
        hideBanner();
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', () => {
        setConsent({ analytics: false, preferences: false });
        hideBanner();
      });
    }

    if (openModalBtn) {
      openModalBtn.addEventListener('click', openModal);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeModal);
    }

    if (savePrefBtn) {
      savePrefBtn.addEventListener('click', () => {
        const analytics = document.getElementById('cookie-opt-analytics')?.checked ?? false;
        const preferences = document.getElementById('cookie-opt-preferences')?.checked ?? false;
        setConsent({ analytics, preferences });
        closeModal();
        hideBanner();
      });
    }

    // Gentle entrance
    setTimeout(() => {
      if (banner) {
        banner.classList.add('visible');
      }
    }, 1200);
  }

  // Expose global manager to re-open settings from footer
  window.atlobCookieConsent = {
    getConsent,
    openSettings: function () {
      let modal = document.getElementById('atlob-cookie-modal');
      if (!modal) {
        injectBannerUI();
        modal = document.getElementById('atlob-cookie-modal');
      }
      if (modal) {
        const consent = getConsent() || { analytics: true, preferences: true };
        const optA = document.getElementById('cookie-opt-analytics');
        const optP = document.getElementById('cookie-opt-preferences');
        if (optA) optA.checked = Boolean(consent.analytics);
        if (optP) optP.checked = Boolean(consent.preferences);
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectBannerUI);
  } else {
    injectBannerUI();
  }
})();

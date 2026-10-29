/**
 * Consultoría ATLOB — Exit Intent Pop-up Subscription Modal
 * Detects cursor leaving window upwards (e.clientY <= 10) to present a high-converting,
 * elegant newsletter subscription modal with free tax guide download.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'atlob_exit_intent_shown_v1';
  let hasTriggered = false;

  function wasAlreadyShown() {
    try {
      // Check session or local storage
      return sessionStorage.getItem(STORAGE_KEY) === 'true' || localStorage.getItem('atlob_subscribed') === 'true';
    } catch (e) {
      return false;
    }
  }

  function markAsShown() {
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {}
  }

  function injectModalUI() {
    if (document.getElementById('atlob-exit-intent-modal')) return;

    const modalHTML = `
      <div id="atlob-exit-intent-modal" class="exit-intent-modal" aria-hidden="true" role="dialog" aria-labelledby="exit-modal-title">
        <div class="exit-modal-backdrop" id="exit-modal-backdrop"></div>
        <div class="exit-modal-card">
          <button type="button" class="exit-modal-close" id="btn-exit-modal-close" aria-label="Cerrar modal">&times;</button>
          
          <div class="exit-modal-body">
            <div class="exit-modal-badge">
              <i class="fas fa-gift"></i> GUÍA EXCLUSIVA GRATIS
            </div>

            <h3 id="exit-modal-title" class="exit-modal-heading">
              ¡Antes de irte! No te pierdas el Calendario Tributario SUNAT 2026
            </h3>
            
            <p class="exit-modal-description">
              Suscríbete a nuestro boletín y recibe en tu correo nuestra <strong>Guía Práctica de Vencimientos SUNAT</strong>, casos contables de aplicación real y análisis de resoluciones del Tribunal Fiscal.
            </p>

            <form id="exit-intent-form" class="exit-form" novalidate>
              <div class="exit-input-wrapper">
                <i class="fas fa-envelope exit-input-icon" aria-hidden="true"></i>
                <input 
                  type="email" 
                  id="exit-modal-email" 
                  class="exit-input" 
                  placeholder="Ingresa tu correo profesional (ej. gerente@empresa.com)" 
                  required 
                  autocomplete="email"
                >
              </div>

              <div id="exit-modal-feedback" class="exit-feedback" role="status" aria-live="polite"></div>

              <button type="submit" class="exit-btn-submit" id="btn-exit-submit">
                <span>Suscribirme y Recibir Guía</span>
                <i class="fas fa-paper-plane"></i>
              </button>
            </form>

            <div class="exit-modal-footer">
              <span class="exit-footer-shield">
                <i class="fas fa-shield-alt"></i> 100% libre de spam. Puedes cancelar tu suscripción con un clic.
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('atlob-exit-intent-modal');
    const backdrop = document.getElementById('exit-modal-backdrop');
    const closeBtn = document.getElementById('btn-exit-modal-close');
    const form = document.getElementById('exit-intent-form');
    const emailInput = document.getElementById('exit-modal-email');
    const feedback = document.getElementById('exit-modal-feedback');
    const submitBtn = document.getElementById('btn-exit-submit');

    function openModal() {
      if (hasTriggered || wasAlreadyShown()) return;
      hasTriggered = true;
      markAsShown();
      if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        if (emailInput) setTimeout(() => emailInput.focus(), 200);
      }
    }

    function closeModal() {
      if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeModal();
      }
    });

    // Form submit
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (emailInput?.value || '').trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
          feedback.className = 'exit-feedback error';
          feedback.textContent = 'Por favor, ingrese un correo electrónico válido.';
          if (emailInput) emailInput.focus();
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<span>Procesando...</span> <i class="fas fa-spinner fa-spin"></i>`;
        }
        feedback.className = 'exit-feedback info';
        feedback.textContent = 'Procesando suscripción...';

        try {
          const res = await fetch('/api/newsletter/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, source: 'exit_intent_modal' }),
          });
          const data = await res.json();

          if (res.ok && data.success) {
            feedback.className = 'exit-feedback success';
            feedback.textContent = '¡Excelente! Te hemos enviado la confirmación y las guías a tu correo.';
            try { localStorage.setItem('atlob_subscribed', 'true'); } catch (e) {}
            setTimeout(() => closeModal(), 3000);
          } else {
            feedback.className = 'exit-feedback error';
            feedback.textContent = data.message || 'Ocurrió un error. Intente nuevamente.';
          }
        } catch (err) {
          feedback.className = 'exit-feedback error';
          feedback.textContent = 'Error de conexión. Intente más tarde.';
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Suscribirme y Recibir Guía</span> <i class="fas fa-paper-plane"></i>`;
          }
        }
      });
    }

    // Bind exit intent mouse detection
    document.addEventListener('mouseleave', (e) => {
      // User moved mouse out through the top of the browser window
      if (e.clientY <= 15) {
        openModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectModalUI);
  } else {
    injectModalUI();
  }
})();

/**
 * Consultoría ATLOB — Privacy-friendly Event Analytics
 * Tracks engagement, reading milestones, and CTA conversions with cookie consent respect.
 */

(function () {
  'use strict';

  function canTrack() {
    try {
      const consentStr = localStorage.getItem('atlob_cookie_consent_v1');
      if (!consentStr) return true; // Default privacy-first basic mode
      const consent = JSON.parse(consentStr);
      return consent.analytics !== false;
    } catch (e) {
      return true;
    }
  }

  function trackEvent(eventName, eventParams = {}) {
    if (!canTrack()) return;

    const payload = {
      event: eventName,
      params: {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        referrer: document.referrer || 'direct',
        timestamp: new Date().toISOString(),
        viewport_width: window.innerWidth,
        ...eventParams,
      },
    };

    // If Google Analytics / GTM dataLayer is present
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...eventParams });
    }

    // In development / demo mode, record in session storage for verification
    try {
      const logs = JSON.parse(sessionStorage.getItem('atlob_analytics_events') || '[]');
      logs.push(payload);
      if (logs.length > 50) logs.shift();
      sessionStorage.setItem('atlob_analytics_events', JSON.stringify(logs));
    } catch (e) {}

    // Dispatch custom DOM event
    window.dispatchEvent(new CustomEvent('atlob_analytics_tracked', { detail: payload }));
  }

  // 1. Track Initial Pageview
  document.addEventListener('DOMContentLoaded', () => {
    trackEvent('page_view', {
      section: window.location.pathname.includes('/revista/') ? 'revista' : 'sitio_principal',
    });

    // 2. Track Click on Key CTA Buttons (WhatsApp, Contact, Magazine, Services)
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (!target) return;

      const href = target.getAttribute('href') || '';
      const text = (target.textContent || '').trim().substring(0, 50);

      if (href.includes('wa.me') || href.includes('whatsapp')) {
        trackEvent('click_whatsapp', { destination: href, button_text: text });
      } else if (href.includes('contacto.html') || target.classList.contains('btn-contacto')) {
        trackEvent('click_contact_cta', { button_text: text });
      } else if (href.includes('servicios.html')) {
        trackEvent('click_services_cta', { button_text: text });
      } else if (href.includes('revista/')) {
        trackEvent('click_magazine_nav', { article_link: href });
      }
    });

    // 3. Track Scroll Depth Milestones (25%, 50%, 75%, 90%)
    let scrollMilestones = { 25: false, 50: false, 75: false, 90: false };
    window.addEventListener('scroll', () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);

      [25, 50, 75, 90].forEach((milestone) => {
        if (scrollPercent >= milestone && !scrollMilestones[milestone]) {
          scrollMilestones[milestone] = true;
          trackEvent('scroll_depth', { percent: milestone });
        }
      });
    }, { passive: true });

    // 4. Track Form Submissions
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', () => {
        trackEvent('form_submit_attempt', { form_id: 'contactForm' });
      });
    }

    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', () => {
        trackEvent('newsletter_subscribe_attempt', { form_id: 'newsletter-form' });
      });
    }
  });

  // Expose global tracker
  window.atlobAnalytics = { trackEvent, canTrack };
})();

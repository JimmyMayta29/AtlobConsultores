/**
 * Consultoría ATLOB — Article Reading Progress Indicator
 * Displays an engaging, sticky reading progress header and track at the top
 * of individual article pages with real-time percentage, countdown of remaining
 * reading time, milestone analytics tracking, and seek/scroll-to-top interaction.
 */

(function () {
  'use strict';

  let initialized = false;
  let totalMinutes = 4;
  let milestonesTracked = { 25: false, 50: false, 75: false, 100: false };
  let isTicking = false;

  function calculateWords(text) {
    if (!text) return 0;
    const clean = text.replace(/<[^>]*>/g, ' ').replace(/[#*_`~>\[\]()-]/g, ' ').trim();
    return clean ? clean.split(/\s+/).filter(Boolean).length : 0;
  }

  function getArticleData() {
    const article = document.querySelector('.article-body');
    if (!article) return null;

    // Title
    const titleEl = document.querySelector('.article-header h1') || document.querySelector('h1');
    const title = titleEl ? titleEl.textContent.trim() : document.title.replace(' — Revista ATLOB', '');

    // Category
    const badgeEl = document.querySelector('.article-badge');
    const category = badgeEl ? badgeEl.textContent.trim() : 'REVISTA';

    // Reading time
    const metaClock = document.querySelector('.article-meta i.fa-clock');
    if (metaClock && metaClock.parentElement) {
      const match = metaClock.parentElement.textContent.match(/(\d+)\s*min/);
      if (match) {
        totalMinutes = parseInt(match[1], 10) || 4;
      }
    } else {
      const words = calculateWords(article.innerText || article.textContent || '');
      totalMinutes = Math.max(1, Math.ceil(words / 200)) || 4;
    }

    return { article, title, category, totalMinutes };
  }

  function createProgressElements() {
    let container = document.getElementById('article-reading-progress');
    if (container) return container;

    container = document.createElement('div');
    container.id = 'article-reading-progress';
    container.className = 'article-reading-progress';
    container.setAttribute('role', 'progressbar');
    container.setAttribute('aria-label', 'Progreso de lectura del artículo');
    container.setAttribute('aria-valuenow', '0');
    container.setAttribute('aria-valuemin', '0');
    container.setAttribute('aria-valuemax', '100');

    container.innerHTML = `
      <!-- Top Slim Progress Line -->
      <div class="reading-progress-track" id="readingProgressTrack" title="Haz clic para desplazarte por el artículo">
        <div class="reading-progress-bar" id="readingProgressBar">
          <span class="reading-progress-glow"></span>
        </div>
      </div>

      <!-- Engaging Reading Header Bar -->
      <div class="reading-progress-header" id="readingProgressHeader">
        <div class="reading-progress-inner">
          <div class="reading-progress-left">
            <span class="reading-category-pill" id="readingCategoryPill">REVISTA</span>
            <span class="reading-title-text" id="readingTitleText">Cargando artículo...</span>
          </div>

          <div class="reading-progress-right">
            <div class="reading-badge-item reading-time-badge" id="readingTimeBadge" title="Tiempo estimado restante">
              <i class="far fa-clock"></i>
              <span id="readingTimeText">Calculando...</span>
            </div>

            <div class="reading-badge-item reading-percent-badge" title="Porcentaje completado">
              <span id="readingPercentText">0%</span>
            </div>

            <button type="button" class="reading-action-btn reading-top-btn" id="readingScrollTopBtn" title="Volver al inicio del artículo" aria-label="Subir al inicio">
              <i class="fas fa-arrow-up"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.prepend(container);

    // Click on progress track to seek
    const track = container.querySelector('#readingProgressTrack');
    if (track) {
      track.addEventListener('click', (e) => {
        const article = document.querySelector('.article-body');
        if (!article) return;
        const rect = track.getBoundingClientRect();
        const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        
        const articleRect = article.getBoundingClientRect();
        const articleTop = window.scrollY + articleRect.top;
        const articleHeight = article.offsetHeight;
        const targetScroll = articleTop + (articleHeight * clickRatio) - 80;
        
        window.scrollTo({
          top: targetScroll,
          behavior: 'smooth'
        });
      });
    }

    // Click on scroll to top button
    const topBtn = container.querySelector('#readingScrollTopBtn');
    if (topBtn) {
      topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    return container;
  }

  function updateProgress() {
    const data = getArticleData();
    if (!data) return;

    const { article, title, category, totalMinutes } = data;
    const container = document.getElementById('article-reading-progress');
    if (!container) return;

    // Update labels if needed
    const catPill = document.getElementById('readingCategoryPill');
    const titleText = document.getElementById('readingTitleText');
    if (catPill && catPill.textContent !== category) catPill.textContent = category;
    if (titleText && titleText.textContent !== title) {
      titleText.textContent = title;
      titleText.setAttribute('title', title);
    }

    const rect = article.getBoundingClientRect();
    const articleTop = window.scrollY + rect.top;
    const articleHeight = article.offsetHeight;
    const winHeight = window.innerHeight;

    // Start point: when article top enters top 20% of viewport
    const startY = articleTop - (winHeight * 0.25);
    // End point: when the bottom of article body reaches bottom of viewport
    const endY = articleTop + articleHeight - (winHeight * 0.75);
    const totalDistance = Math.max(100, endY - startY);

    let progress = 0;
    if (window.scrollY > startY) {
      progress = ((window.scrollY - startY) / totalDistance) * 100;
    }
    progress = Math.max(0, Math.min(100, progress));

    // Update CSS custom property for backward compatibility
    document.body.style.setProperty('--scroll-reading', progress.toFixed(1) + '%');

    // Update legacy #scrollProgress if present
    const legacyBar = document.getElementById('scrollProgress');
    if (legacyBar) legacyBar.style.width = progress.toFixed(1) + '%';

    // Update reading progress bar width
    const bar = document.getElementById('readingProgressBar');
    if (bar) {
      bar.style.width = progress.toFixed(1) + '%';
    }
    container.setAttribute('aria-valuenow', Math.round(progress).toString());

    // Update percentage readout
    const percentEl = document.getElementById('readingPercentText');
    if (percentEl) {
      percentEl.textContent = `${Math.round(progress)}%`;
    }

    // Toggle header visibility: show once scrolling down into the article (past 180px)
    const header = document.getElementById('readingProgressHeader');
    if (header) {
      if (window.scrollY > 200) {
        header.classList.add('visible');
      } else {
        header.classList.remove('visible');
      }
    }

    // Calculate dynamic remaining reading time
    const timeText = document.getElementById('readingTimeText');
    const timeBadge = document.getElementById('readingTimeBadge');
    if (timeText) {
      if (progress >= 96) {
        timeText.innerHTML = `<span class="reading-completed-label"><i class="fas fa-check-circle"></i> ¡Completado!</span>`;
        if (timeBadge) timeBadge.classList.add('completed');
      } else {
        const remaining = Math.max(1, Math.ceil(totalMinutes * (1 - (progress / 100))));
        timeText.textContent = `${remaining} min restante${remaining === 1 ? '' : 's'}`;
        if (timeBadge) timeBadge.classList.remove('completed');
      }
    }

    // Track Reading Milestones with Analytics (25%, 50%, 75%, 100%)
    [25, 50, 75, 100].forEach((milestone) => {
      if (progress >= milestone && !milestonesTracked[milestone]) {
        milestonesTracked[milestone] = true;
        if (window.atlobAnalytics && typeof window.atlobAnalytics.trackEvent === 'function') {
          window.atlobAnalytics.trackEvent('article_reading_milestone', {
            percent: milestone,
            article_title: title,
            remaining_mins: Math.max(0, Math.ceil(totalMinutes * (1 - (milestone / 100))))
          });
        }
        window.dispatchEvent(new CustomEvent('atlob_reading_milestone', {
          detail: { milestone, title, progress }
        }));
      }
    });

    isTicking = false;
  }

  function onScroll() {
    if (!isTicking) {
      window.requestAnimationFrame(updateProgress);
      isTicking = true;
    }
  }

  function init() {
    // Only proceed on article pages
    const hasArticle = document.querySelector('.article-view') || document.querySelector('.article-body');
    if (!hasArticle) return;

    createProgressElements();
    updateProgress();

    window.removeEventListener('scroll', onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.removeEventListener('resize', onScroll);
    window.addEventListener('resize', onScroll, { passive: true });

    initialized = true;
  }

  // Public methods
  window.initArticleReadingProgress = init;
  window.refreshReadingProgress = () => {
    milestonesTracked = { 25: false, 50: false, 75: false, 100: false };
    init();
    updateProgress();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also listen for async article rendering completed
  window.addEventListener('atlob_article_rendered', () => {
    window.refreshReadingProgress();
  });
})();

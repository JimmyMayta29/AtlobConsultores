let allArticlesCache = [];
let currentCategory = 'all';
let currentSearchQuery = '';

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Determinar si estamos en index.html o articulo.html
    const isIndexPage = document.getElementById("articles-grid") !== null;
    const isArticlePage = document.querySelector(".article-view") !== null;

    if (isIndexPage) {
        await initRevistaIndex();
    } else if (isArticlePage) {
        await renderSingleArticle();
    }
});

/**
 * Normaliza texto para búsqueda insensible a mayúsculas y acentos
 */
function normalizeStr(str) {
    if (!str) return '';
    return str
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

/**
 * Resalta las coincidencias de búsqueda en un texto
 */
function highlightText(text, query) {
    if (!text || !query) return text || '';
    const cleanQuery = query.trim();
    if (!cleanQuery) return text;
    try {
        const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    } catch (e) {
        return text;
    }
}

/**
 * Inicializa la página principal de la revista con buscador y filtros
 */
async function initRevistaIndex() {
    const grid = document.getElementById("articles-grid");
    const searchInput = document.getElementById("magazine-search-input");
    const clearBtn = document.getElementById("magazine-search-clear");
    const navCategories = document.querySelectorAll(".magazine-nav-pill");

    try {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px 0; color: var(--azul-principal);">
                <i class="fas fa-spinner fa-spin fa-2x" style="margin-bottom: 12px;"></i>
                <p style="font-weight: 500;">Cargando publicaciones de la Revista ATLOB...</p>
            </div>
        `;

        const response = await atlobApi.getArticles();
        if (!response.success || !response.data) {
            grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 40px 0;">No hay artículos disponibles en este momento.</p>';
            return;
        }

        allArticlesCache = response.data.articles || response.data || [];

        if (allArticlesCache.length === 0) {
            grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 40px 0;">Aún no se han publicado artículos.</p>';
            return;
        }

        // Render inicial de destacados y cuadrícula
        renderFeaturedArticle(allArticlesCache[0]);
        applyFiltersAndRender();

        // 1. Evento de Búsqueda Dinámica mientras el usuario escribe
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                currentSearchQuery = e.target.value;
                if (clearBtn) {
                    clearBtn.style.display = currentSearchQuery.length > 0 ? "flex" : "none";
                }
                applyFiltersAndRender();
            });

            // Tecla Escape para limpiar búsqueda
            searchInput.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    searchInput.value = "";
                    currentSearchQuery = "";
                    if (clearBtn) clearBtn.style.display = "none";
                    applyFiltersAndRender();
                }
            });
        }

        // 2. Botón limpiar búsqueda
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                if (searchInput) {
                    searchInput.value = "";
                    searchInput.focus();
                }
                currentSearchQuery = "";
                clearBtn.style.display = "none";
                applyFiltersAndRender();
            });
        }

        // 3. Filtrado por categorías en el cliente
        navCategories.forEach(pill => {
            pill.addEventListener("click", (e) => {
                e.preventDefault();
                const selectedCat = pill.getAttribute("data-category") || "all";
                currentCategory = selectedCat;

                navCategories.forEach(p => p.classList.remove("active"));
                pill.classList.add("active");

                applyFiltersAndRender();
            });
        });

    } catch (error) {
        console.error("Error inicializando revista:", error);
        grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1; padding: 40px 0; color: #ef4444;">Ocurrió un error al cargar los artículos. Por favor, recarga la página.</p>';
    }
}

/**
 * Renderiza el artículo destacado
 */
function renderFeaturedArticle(featured) {
    const featuredContainer = document.getElementById("featured-article-container");
    if (!featuredContainer || !featured) return;

    const imageUrl = atlobApi.resolveImageUrl(featured.featuredImage || featured.thumbnailImage);
    const catName = featured.category ? featured.category.name : 'GENERAL';

    featuredContainer.innerHTML = `
        <section class="featured-post-container" style="opacity:0; transform:translateY(20px); transition: all 0.5s ease;">
            <div class="featured-post-card">
                <div class="featured-image">
                    <img src="${imageUrl}" alt="${featured.title}" loading="lazy">
                </div>
                <div class="featured-content">
                    <span class="post-category-badge">DESTACADO: ${catName}</span>
                    <h2>${featured.title}</h2>
                    <p>${featured.excerpt || 'Revisa este análisis normativo y técnico elaborado por el equipo de Consultoría ATLOB.'}</p>
                    <a href="articulo.html?slug=${featured.slug}" class="btn-pill">
                        <span>Leer artículo</span>
                        <span class="btn-pill-arrow"><i class="fas fa-arrow-right"></i></span>
                    </a>
                </div>
            </div>
        </section>
    `;

    setTimeout(() => {
        const el = featuredContainer.querySelector(".featured-post-container");
        if (el) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
        }
    }, 50);
}

/**
 * Aplica los filtros activos (búsqueda y categoría) y redibuja la cuadrícula
 */
function applyFiltersAndRender() {
    const grid = document.getElementById("articles-grid");
    const feedbackEl = document.getElementById("search-feedback");
    const featuredContainer = document.getElementById("featured-article-container");
    if (!grid) return;

    const normalizedQuery = normalizeStr(currentSearchQuery);

    // Filtrar artículos
    const filtered = allArticlesCache.filter(article => {
        // Filtro por categoría
        if (currentCategory !== 'all') {
            const artCatName = normalizeStr(article.category ? article.category.name : '');
            const artCatSlug = normalizeStr(article.category ? article.category.slug : '');
            const targetCat = normalizeStr(currentCategory);
            if (artCatName !== targetCat && artCatSlug !== targetCat) {
                return false;
            }
        }

        // Filtro por texto de búsqueda
        if (normalizedQuery) {
            const titleNorm = normalizeStr(article.title);
            const excerptNorm = normalizeStr(article.excerpt);
            const catNorm = normalizeStr(article.category ? article.category.name : '');
            const tagsNorm = article.tags && Array.isArray(article.tags) 
                ? article.tags.map(t => normalizeStr(t.name)).join(' ') 
                : '';
            const contentNorm = normalizeStr(article.content);

            const matches = titleNorm.includes(normalizedQuery) ||
                            excerptNorm.includes(normalizedQuery) ||
                            catNorm.includes(normalizedQuery) ||
                            tagsNorm.includes(normalizedQuery) ||
                            contentNorm.includes(normalizedQuery);

            if (!matches) return false;
        }

        return true;
    });

    // Controlar visibilidad del artículo destacado si se busca o filtra
    if (featuredContainer) {
        if (normalizedQuery) {
            featuredContainer.style.display = "none";
        } else if (currentCategory !== 'all') {
            featuredContainer.style.display = "none";
        } else {
            featuredContainer.style.display = "block";
        }
    }

    // Actualizar barra de estado de búsqueda
    if (feedbackEl) {
        if (normalizedQuery || currentCategory !== 'all') {
            feedbackEl.style.display = "flex";
            let statusText = `<span>Mostrando <strong>${filtered.length}</strong> artículo${filtered.length === 1 ? '' : 's'}</span>`;
            if (normalizedQuery) {
                statusText += ` para "<mark>${escapeHtml(currentSearchQuery)}</mark>"`;
            }
            if (currentCategory !== 'all') {
                statusText += ` en categoría <em>${escapeHtml(currentCategory)}</em>`;
            }
            feedbackEl.innerHTML = `
                <div class="search-feedback-content">
                    <i class="fas fa-filter"></i> ${statusText}
                </div>
                <button type="button" class="btn-clear-filters" id="btn-clear-all-filters">
                    <i class="fas fa-redo"></i> Restablecer filtros
                </button>
            `;

            const resetBtn = document.getElementById("btn-clear-all-filters");
            if (resetBtn) {
                resetBtn.addEventListener("click", resetAllFilters);
            }
        } else {
            feedbackEl.style.display = "none";
            feedbackEl.innerHTML = "";
        }
    }

    // Renderizar resultados en el grid
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="magazine-empty-state" style="grid-column: 1/-1;">
                <div class="empty-state-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>No se encontraron publicaciones</h3>
                <p>No encontramos artículos que coincidan con <strong>"${escapeHtml(currentSearchQuery)}"</strong>${currentCategory !== 'all' ? ` en la categoría <em>${escapeHtml(currentCategory)}</em>` : ''}.</p>
                <div class="empty-state-actions">
                    <button type="button" class="btn-pill" id="btn-empty-reset">
                        <span>Ver todos los artículos</span>
                        <span class="btn-pill-arrow"><i class="fas fa-arrow-right"></i></span>
                    </button>
                </div>
            </div>
        `;

        const emptyResetBtn = document.getElementById("btn-empty-reset");
        if (emptyResetBtn) {
            emptyResetBtn.addEventListener("click", resetAllFilters);
        }
        return;
    }

    // Dibujar tarjetas de artículos
    grid.innerHTML = filtered.map(article => {
        const imageUrl = atlobApi.resolveImageUrl(article.thumbnailImage || article.featuredImage);
        const dateStr = atlobApi.formatDate(article.publishedAt || article.createdAt);
        const catName = article.category ? article.category.name : 'GENERAL';

        const displayTitle = normalizedQuery 
            ? highlightText(article.title, currentSearchQuery) 
            : article.title;

        const displayExcerpt = normalizedQuery 
            ? highlightText(article.excerpt || '', currentSearchQuery) 
            : (article.excerpt || '');

        return `
            <article class="magazine-post-card reveal from-bottom" data-category="${catName}">
                <div class="post-card-img">
                    <span class="post-category-badge">${catName}</span>
                    <img src="${imageUrl}" alt="${escapeHtml(article.title)}" loading="lazy">
                </div>
                <div class="post-card-content">
                    <div class="post-meta">
                        <span><i class="far fa-calendar"></i> ${dateStr}</span>
                        <span class="meta-separator">•</span>
                        <span><i class="far fa-clock"></i> ${article.readTime || 5} min</span>
                    </div>
                    <h3 class="post-title">
                        <a href="articulo.html?slug=${article.slug}">${displayTitle}</a>
                    </h3>
                    <p class="post-excerpt">${displayExcerpt}</p>
                    <a href="articulo.html?slug=${article.slug}" class="post-read-more">
                        <span>Leer artículo</span>
                        <i class="fas fa-long-arrow-alt-right"></i>
                    </a>
                </div>
            </article>
        `;
    }).join('');
}

/**
 * Restablece todos los filtros de búsqueda y categoría
 */
function resetAllFilters() {
    currentSearchQuery = '';
    currentCategory = 'all';

    const searchInput = document.getElementById("magazine-search-input");
    if (searchInput) {
        searchInput.value = '';
    }

    const clearBtn = document.getElementById("magazine-search-clear");
    if (clearBtn) {
        clearBtn.style.display = 'none';
    }

    const navCategories = document.querySelectorAll(".magazine-nav-pill");
    navCategories.forEach(p => {
        if (p.getAttribute("data-category") === "all") {
            p.classList.add("active");
        } else {
            p.classList.remove("active");
        }
    });

    applyFiltersAndRender();
}

/**
 * Sanitiza texto contra XSS simple
 */
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Renderiza el artículo individual
 */
async function renderSingleArticle() {
    // Obtener el slug de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        document.querySelector('.article-body').innerHTML = '<h2>Artículo no especificado</h2><p>Regresa a la revista para seleccionar uno.</p>';
        return;
    }

    try {
        const response = await atlobApi.getArticleBySlug(slug);
        
        if (!response.success || !response.data) {
            document.querySelector('.article-body').innerHTML = '<h2>Artículo no encontrado</h2><p>Es posible que haya sido eliminado o no exista.</p>';
            return;
        }

        const article = response.data;
        
        // Rellenar cabecera
        const header = document.querySelector('.article-header');
        const bgImg = atlobApi.resolveImageUrl(article.featuredImage || article.thumbnailImage);
        header.style.backgroundImage = `linear-gradient(rgba(10, 42, 71, 0.8), rgba(10, 42, 71, 0.9)), url('${bgImg}')`;
        
        const catName = article.category ? article.category.name : 'GENERAL';
        document.querySelector('.article-badge').textContent = catName;
        document.querySelector('.article-header-content h1').textContent = article.title;
        document.title = `${article.title} - Consultoría ATLOB`;
        
        // Meta info
        const metaSpans = document.querySelectorAll('.article-meta span:not(.divider)');
        if(metaSpans.length >= 3) {
            metaSpans[0].innerHTML = `<i class="far fa-calendar"></i> ${atlobApi.formatDate(article.publishedAt || article.createdAt)}`;
            metaSpans[1].innerHTML = `<i class="far fa-clock"></i> ${article.readTime || 5} min de lectura`;
            metaSpans[2].innerHTML = `<i class="far fa-user"></i> ${article.author ? article.author.name : 'Equipo ATLOB'}`;
        }

        // Rellenar contenido (el backend envía el markdown renderizado en 'contentHtml')
        document.querySelector('.article-body').innerHTML = article.contentHtml || article.content;

    } catch (error) {
        console.error("Error renderizando artículo:", error);
        document.querySelector('.article-body').innerHTML = '<h2>Error al cargar</h2><p>Inténtalo nuevamente más tarde.</p>';
    }
}

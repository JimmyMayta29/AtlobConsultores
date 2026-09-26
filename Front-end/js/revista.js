document.addEventListener("DOMContentLoaded", async () => {
    // Determine context
    const grid = document.getElementById("articles-grid") || document.querySelector(".magazine-grid");
    const isArticlePage = document.querySelector(".article-view") !== null && window.location.pathname.includes("articulo.html");

    if (grid && !isArticlePage) {
        await renderMagazineGrid(grid);
    } else if (isArticlePage) {
        await renderSingleArticle();
    }
});

// Static Fallback Registry of Articles
const STATIC_ARTICLES = [
    {
        title: "Nuevo Cronograma de Vencimientos SUNAT 2026",
        slug: "cronograma-vencimientos-sunat-2026",
        category: "Normativa Tributaria",
        categorySlug: "tributario",
        featuredImage: "../img/tech_cloud_1775951834123.png",
        thumbnailImage: "../img/tech_cloud_1775951834123.png",
        publishedAt: "2026-04-20",
        readTime: 8,
        author: "Jimmy CP",
        url: "posts/cronograma-vencimientos-sunat-2026.html",
        excerpt: "Revisa las fechas críticas para la declaración del IGV y Renta mensual según el último dígito de tu RUC. Evita multas y sanciones ante la administración tributaria."
    },
    {
        title: "Asiento Contable por Compra de Computadora (Laptop)",
        slug: "asiento-contable-compra-computadora",
        category: "Casos Prácticos",
        categorySlug: "contabilidad",
        featuredImage: "../img/tech_automation_1775951818804.png",
        thumbnailImage: "../img/tech_automation_1775951818804.png",
        publishedAt: "2026-04-14",
        readTime: 6,
        author: "Equipo Analítico ATLOB",
        url: "posts/asiento-contable-compra-computadora.html",
        excerpt: "Análisis práctico del registro contable de adquisición de equipos informáticos, cuentas contables involucradas, IGV y tratamiento según el artículo 18° de la LIR."
    },
    {
        title: "Auditoría Preventiva y Aplicación de NIIF para PYMES",
        slug: "auditoria-preventiva-niif",
        category: "Auditoría y NIIF",
        categorySlug: "auditoria",
        featuredImage: "../iconos/reportes.jpg",
        thumbnailImage: "../iconos/reportes.jpg",
        publishedAt: "2026-04-10",
        readTime: 7,
        author: "Consultoría ATLOB",
        url: "../servicios.html",
        excerpt: "Cómo una auditoría preventiva permite detectar inconsistencias tributarias y optimizar los estados financieros bajo estándares internacionales NIIF."
    },
    {
        title: "Gestión Eficiente de Planillas y Régimen Laboral 2026",
        slug: "gestion-planillas-laboral",
        category: "Laboral y Planillas",
        categorySlug: "laboral",
        featuredImage: "../iconos/laboral.jpg",
        thumbnailImage: "../iconos/laboral.jpg",
        publishedAt: "2026-04-05",
        readTime: 5,
        author: "Equipo Laboral ATLOB",
        url: "../servicios.html",
        excerpt: "Lineamientos fundamentales para la liquidación oportuna de beneficios sociales, cálculo de gratificaciones, CTS y aportes a EsSalud."
    }
];

/**
 * Format Date to Spanish Readable String
 */
function formatReadableDate(dateString) {
    if (!dateString) return "Reciente";
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    } catch {
        return dateString;
    }
}

/**
 * Render Main Magazine or Category Grid
 */
async function renderMagazineGrid(grid) {
    const featuredContainer = document.getElementById("featured-article-container");
    const currentPath = window.location.pathname.toLowerCase().replace(/\\/g, '/');

    // Detect active category by filename
    let activeCategorySlug = 'all';
    if (currentPath.includes('tributario.html')) activeCategorySlug = 'tributario';
    else if (currentPath.includes('contabilidad.html')) activeCategorySlug = 'contabilidad';
    else if (currentPath.includes('auditoria.html')) activeCategorySlug = 'auditoria';
    else if (currentPath.includes('laboral.html')) activeCategorySlug = 'laboral';

    let articles = [];

    // Attempt to load from Backend API if available
    if (typeof atlobApi !== 'undefined' && atlobApi.getArticles) {
        try {
            const apiRes = await atlobApi.getArticles();
            if (apiRes && apiRes.success && apiRes.data) {
                const apiArticles = Array.isArray(apiRes.data) ? apiRes.data : (apiRes.data.articles || []);
                if (apiArticles.length > 0) {
                    articles = apiArticles.map(a => ({
                        title: a.title,
                        slug: a.slug,
                        category: a.category ? a.category.name : 'GENERAL',
                        categorySlug: a.category ? (a.category.slug || a.category.name.toLowerCase()) : 'general',
                        featuredImage: atlobApi.resolveImageUrl(a.featuredImage || a.thumbnailImage),
                        thumbnailImage: atlobApi.resolveImageUrl(a.thumbnailImage || a.featuredImage),
                        publishedAt: a.publishedAt || a.createdAt,
                        readTime: a.readTime || 5,
                        author: a.author ? a.author.name : 'Equipo ATLOB',
                        url: `articulo.html?slug=${a.slug}`,
                        excerpt: a.excerpt || ''
                    }));
                }
            }
        } catch (e) {
            console.info("Using static article registry for Revista.");
        }
    }

    // Merge or fallback to Static Articles
    if (articles.length === 0) {
        articles = STATIC_ARTICLES;
    } else {
        // Ensure static posts are included if not present
        STATIC_ARTICLES.forEach(staticArt => {
            if (!articles.some(a => a.slug === staticArt.slug)) {
                articles.push(staticArt);
            }
        });
    }

    // Filter by category if not on "All / index.html"
    let filteredArticles = articles;
    if (activeCategorySlug !== 'all') {
        filteredArticles = articles.filter(a => {
            const catSlug = (a.categorySlug || '').toLowerCase();
            const catName = (a.category || '').toLowerCase();
            return catSlug.includes(activeCategorySlug) || catName.includes(activeCategorySlug);
        });
    }

    // Render Featured Article Slot if present
    if (featuredContainer) {
        const featured = filteredArticles[0] || articles[0];
        if (featured) {
            featuredContainer.innerHTML = `
                <section class="featured-post-container reveal from-bottom" style="opacity: 1; transform: translateY(0);">
                    <div class="featured-post-card">
                        <div class="featured-image">
                            <img src="${featured.featuredImage}" alt="${featured.title}">
                        </div>
                        <div class="featured-content">
                            <span class="post-category-badge">DESTACADO: ${featured.category.toUpperCase()}</span>
                            <h2>${featured.title}</h2>
                            <p>${featured.excerpt || 'Análisis técnico y práctico preparado por nuestros especialistas.'}</p>
                            <a href="${featured.url}" class="btn-pill">
                                <span>Leer ahora</span>
                                <span class="btn-pill-arrow"><i class="fas fa-arrow-right"></i></span>
                            </a>
                        </div>
                    </div>
                </section>
            `;
        }
    }

    // Render Grid Cards
    grid.innerHTML = '';
    if (filteredArticles.length === 0) {
        grid.innerHTML = `
            <div style="text-align: center; grid-column: 1/-1; padding: 40px 20px;">
                <p style="color: var(--gris-suave); font-size: 1.1rem;">Pronto publicaremos nuevos artículos en esta categoría.</p>
                <a href="index.html" class="btn-pill" style="margin-top: 16px; display: inline-flex;">
                    <span>Ver todos los artículos</span>
                    <span class="btn-pill-arrow"><i class="fas fa-arrow-left"></i></span>
                </a>
            </div>
        `;
        return;
    }

    filteredArticles.forEach((article, index) => {
        const dateStr = formatReadableDate(article.publishedAt);
        const cardHTML = `
            <article class="magazine-post-card reveal from-bottom" data-category="${article.category}" style="opacity: 1; transform: translateY(0);">
                <div class="post-card-img">
                    <span class="post-category-badge">${article.category}</span>
                    <img src="${article.thumbnailImage || article.featuredImage}" alt="${article.title}" loading="lazy">
                </div>
                <div class="post-card-content">
                    <div class="post-meta">
                        <i class="far fa-calendar"></i> ${dateStr}
                        <span style="margin: 0 5px">•</span>
                        <i class="far fa-clock"></i> ${article.readTime || 5} min
                    </div>
                    <h3 class="post-title"><a href="${article.url}">${article.title}</a></h3>
                    <p class="post-excerpt">${article.excerpt || ''}</p>
                    <a href="${article.url}" class="post-read-more">Ver detalles <i class="fas fa-long-arrow-alt-right"></i></a>
                </div>
            </article>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

/**
 * Render Single Article View
 */
async function renderSingleArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    // Check if it's one of the static posts with dedicated HTML
    const staticMatch = STATIC_ARTICLES.find(a => a.slug === slug);
    if (staticMatch && staticMatch.url && staticMatch.url.includes('.html') && !staticMatch.url.includes('articulo.html')) {
        window.location.replace(staticMatch.url);
        return;
    }

    const bodyContainer = document.querySelector('.article-body');
    if (!bodyContainer) return;

    if (!slug) {
        bodyContainer.innerHTML = '<h2>Artículo no especificado</h2><p>Seleccione un artículo de la revista.</p>';
        return;
    }

    try {
        if (typeof atlobApi !== 'undefined' && atlobApi.getArticleBySlug) {
            const res = await atlobApi.getArticleBySlug(slug);
            if (res && res.success && res.data) {
                const article = res.data;
                const header = document.querySelector('.article-header');
                const bgImg = atlobApi.resolveImageUrl(article.featuredImage || article.thumbnailImage);
                if (header) {
                    header.style.backgroundImage = `linear-gradient(rgba(10, 42, 71, 0.8), rgba(10, 42, 71, 0.9)), url('${bgImg}')`;
                }
                const badge = document.querySelector('.article-badge');
                if (badge) badge.textContent = article.category ? article.category.name : 'GENERAL';

                const titleEl = document.querySelector('.article-header-content h1');
                if (titleEl) titleEl.textContent = article.title;
                document.title = `${article.title} — Consultoría ATLOB`;

                bodyContainer.innerHTML = article.contentHtml || article.content;
                return;
            }
        }
    } catch (e) {
        console.error("Error loading article dynamically:", e);
    }

    bodyContainer.innerHTML = '<h2>Artículo disponible en breve</h2><p>Este artículo se encuentra en proceso de edición o revisión. Regrese a la revista para explorar otras publicaciones.</p>';
}

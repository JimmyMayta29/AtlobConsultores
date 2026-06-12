document.addEventListener("DOMContentLoaded", async () => {
    // 1. Determinar si estamos en index.html o articulo.html
    const isIndexPage = document.getElementById("articles-grid") !== null;
    const isArticlePage = document.querySelector(".article-view") !== null;

    if (isIndexPage) {
        await renderIndexArticles();
    } else if (isArticlePage) {
        await renderSingleArticle();
    }
});

/**
 * Renderiza los artículos en la cuadrícula principal de la revista
 */
async function renderIndexArticles() {
    const grid = document.getElementById("articles-grid");
    const featuredContainer = document.getElementById("featured-article-container");

    try {
        // Mostrar estado de carga
        grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Cargando artículos...</p>';

        const response = await atlobApi.getArticles();
        if (!response.success || !response.data) {
            grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">No hay artículos disponibles en este momento.</p>';
            return;
        }

        const articles = response.data.articles || response.data; // Dependiendo de la estructura exacta de paginación del backend
        
        if (articles.length === 0) {
            grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Aún no se han publicado artículos.</p>';
            return;
        }

        grid.innerHTML = '';
        
        // El primer artículo lo ponemos como destacado si el contenedor existe
        if (featuredContainer && articles.length > 0) {
            const featured = articles[0];
            const imageUrl = atlobApi.resolveImageUrl(featured.featuredImage || featured.thumbnailImage);
            const catName = featured.category ? featured.category.name : 'GENERAL';
            
            featuredContainer.innerHTML = `
                <section class="featured-post-container" style="opacity:0; transform:translateY(30px); transition: all 0.6s ease;">
                    <div class="featured-post-card">
                        <div class="featured-image">
                            <img src="${imageUrl}" alt="${featured.title}">
                        </div>
                        <div class="featured-content">
                            <span class="post-category-badge">DESTACADO: ${catName}</span>
                            <h2>${featured.title}</h2>
                            <p>${featured.excerpt || 'Lee este artículo de nuestro equipo de expertos.'}</p>
                            <a href="articulo.html?slug=${featured.slug}" class="btn-pill">
                                <span>Leer ahora</span>
                                <span class="btn-pill-arrow"><i class="fas fa-arrow-right"></i></span>
                            </a>
                        </div>
                    </div>
                </section>
            `;
            
            // No removemos el primero de la lista para que también aparezca en la cuadrícula general
            // articles.shift();
        }

        // Renderizar el resto en el grid
        articles.forEach((article, index) => {
            const imageUrl = atlobApi.resolveImageUrl(article.thumbnailImage || article.featuredImage);
            const dateStr = atlobApi.formatDate(article.publishedAt || article.createdAt);
            const catName = article.category ? article.category.name : 'GENERAL';

            const articleHTML = `
                <article class="magazine-post-card reveal from-bottom" data-category="${catName}" style="opacity:0; transform:translateY(20px);">
                    <div class="post-card-img">
                        <span class="post-category-badge">${catName}</span>
                        <img src="${imageUrl}" alt="${article.title}" loading="lazy">
                    </div>
                    <div class="post-card-content">
                        <div class="post-meta">
                            <i class="far fa-calendar"></i> ${dateStr}
                            <span style="margin: 0 5px">•</span>
                            <i class="far fa-clock"></i> ${article.readTime || 5} min
                        </div>
                        <h3 class="post-title"><a href="articulo.html?slug=${article.slug}">${article.title}</a></h3>
                        <p class="post-excerpt">${article.excerpt || ''}</p>
                        <a href="articulo.html?slug=${article.slug}" class="post-read-more">Ver detalles <i class="fas fa-long-arrow-alt-right"></i></a>
                    </div>
                </article>
            `;
            grid.insertAdjacentHTML('beforeend', articleHTML);
        });

        // Aplicar animación al grid
        const items = document.querySelectorAll(".magazine-post-card");
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.transition = "all 0.5s ease";
                item.style.opacity = "1";
                item.style.transform = "translateY(0)";
            }, index * 120);
        });

        // Aplicar animación al artículo destacado
        const featuredEl = document.querySelector(".featured-post-container");
        if (featuredEl) {
            setTimeout(() => {
                featuredEl.style.opacity = "1";
                featuredEl.style.transform = "translateY(0)";
            }, 100);
        }

    } catch (error) {
        console.error("Error renderizando artículos:", error);
        grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Ocurrió un error al cargar los artículos.</p>';
    }
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

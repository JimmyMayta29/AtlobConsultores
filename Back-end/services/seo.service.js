/**
 * SEO Service — Auto-generate meta tags for articles
 */

/**
 * Generate or validate meta tags
 * @param {Object} data - { title, excerpt, metaTitle, metaDescription }
 * @returns {{ metaTitle: string, metaDescription: string }}
 */
const generateMetaTags = (data) => {
  const SITE_NAME = 'Consultoría ATLOB';

  let metaTitle = data.metaTitle;
  if (!metaTitle) {
    metaTitle = `${data.title} — ${SITE_NAME}`;
    // Truncate to 60 chars for Google
    if (metaTitle.length > 60) {
      metaTitle = data.title.substring(0, 56) + '...';
    }
  }

  let metaDescription = data.metaDescription;
  if (!metaDescription) {
    metaDescription = data.excerpt || data.title;
    // Truncate to 160 chars for Google
    if (metaDescription.length > 160) {
      metaDescription = metaDescription.substring(0, 157) + '...';
    }
  }

  return { metaTitle, metaDescription };
};

/**
 * Generate a sitemap XML string from published articles and static pages
 * @param {Array} articles - Array of article objects
 * @param {string} baseUrl - Site base URL
 * @returns {string} XML string
 */
const generateSitemap = (articles, baseUrl = 'https://consultoriaatlob.pe') => {
  const staticPages = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/servicios.html`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${baseUrl}/nosotros.html`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/contacto.html`, priority: '0.9', changefreq: 'monthly' },
    { loc: `${baseUrl}/revista/index.html`, priority: '0.95', changefreq: 'daily' },
    { loc: `${baseUrl}/revista/tributario.html`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${baseUrl}/revista/contabilidad.html`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${baseUrl}/revista/auditoria.html`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${baseUrl}/revista/laboral.html`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${baseUrl}/politica-de-privacidad.html`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${baseUrl}/terminos-y-condiciones.html`, priority: '0.5', changefreq: 'monthly' },
  ];

  const staticXml = staticPages.map(page => `
    <url>
      <loc>${page.loc}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`).join('');

  const articlesXml = articles.map(article => `
    <url>
      <loc>${baseUrl}/revista/articulo.html?slug=${article.slug}</loc>
      <lastmod>${new Date(article.updatedAt || article.publishedAt || Date.now()).toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.85</priority>
    </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticXml}
${articlesXml}
</urlset>`.trim();
};

/**
 * Generate RSS feed XML
 * @param {Array} articles
 * @param {string} baseUrl
 * @returns {string}
 */
const generateRSSFeed = (articles, baseUrl = 'https://consultoriaatlob.pe') => {
  const items = articles.map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/revista/articulo.html?slug=${article.slug}</link>
      <description><![CDATA[${article.excerpt || article.title}]]></description>
      <pubDate>${new Date(article.publishedAt || article.createdAt || Date.now()).toUTCString()}</pubDate>
      <guid isPermaLink="true">${baseUrl}/revista/articulo.html?slug=${article.slug}</guid>
      <category>${article.category ? article.category.name : 'General'}</category>
      <author>contacto@atlob.pe (Consultoría ATLOB)</author>
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Revista ATLOB — Soluciones Contables y Normativa SUNAT</title>
    <link>${baseUrl}/revista/index.html</link>
    <description>Publicaciones sobre análisis fiscal, asientos contables del PCGE, NIIF, cronogramas SUNAT y gestión laboral en el Perú.</description>
    <language>es-PE</language>
    <copyright>© 2026 Consultoría ATLOB S.A.C.</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`.trim();
};

module.exports = { generateMetaTags, generateSitemap, generateRSSFeed };

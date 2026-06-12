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
 * Generate a sitemap XML string from published articles
 * @param {Array} articles - Array of article objects
 * @param {string} baseUrl - Site base URL
 * @returns {string} XML string
 */
const generateSitemap = (articles, baseUrl = 'https://atlob.com') => {
  const urls = articles.map(article => `
    <url>
      <loc>${baseUrl}/revista/${article.slug}</loc>
      <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${baseUrl}</loc>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>${baseUrl}/revista</loc>
      <changefreq>daily</changefreq>
      <priority>0.9</priority>
    </url>${urls}
</urlset>`;
};

/**
 * Generate RSS feed XML
 * @param {Array} articles
 * @param {string} baseUrl
 * @returns {string}
 */
const generateRSSFeed = (articles, baseUrl = 'https://atlob.com') => {
  const items = articles.map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${baseUrl}/revista/${article.slug}</link>
      <description><![CDATA[${article.excerpt || ''}]]></description>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <guid>${baseUrl}/revista/${article.slug}</guid>
      <category>${article.category ? article.category.name : 'General'}</category>
    </item>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Revista ATLOB — Consultoría Contable</title>
    <link>${baseUrl}/revista</link>
    <description>Análisis fiscal, asientos contables y novedades normativas.</description>
    <language>es-PE</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
};

module.exports = { generateMetaTags, generateSitemap, generateRSSFeed };

const router = require('express').Router();
const { Article, Category } = require('../models');
const { generateSitemap, generateRSSFeed } = require('../services/seo.service');

// Import route modules
const authRoutes = require('./auth.routes');
const articleRoutes = require('./article.routes');
const categoryRoutes = require('./category.routes');
const tagRoutes = require('./tag.routes');
const mediaRoutes = require('./media.routes');
const dashboardRoutes = require('./dashboard.routes');
const newsletterRoutes = require('./newsletter.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/media', mediaRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/newsletter', newsletterRoutes);

// SEO — Sitemap
router.get('/sitemap.xml', async (req, res) => {
  try {
    const articles = await Article.findAll({
      where: { status: 'published' },
      attributes: ['slug', 'updatedAt'],
      order: [['publishedAt', 'DESC']],
    });

    const baseUrl = req.protocol + '://' + req.get('host');
    const xml = generateSitemap(articles, baseUrl);

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

// SEO — RSS Feed
router.get('/rss', async (req, res) => {
  try {
    const articles = await Article.findAll({
      where: { status: 'published' },
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      attributes: ['title', 'slug', 'excerpt', 'publishedAt'],
      order: [['publishedAt', 'DESC']],
      limit: 20,
    });

    const baseUrl = req.protocol + '://' + req.get('host');
    const xml = generateRSSFeed(articles, baseUrl);

    res.set('Content-Type', 'application/rss+xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating RSS feed');
  }
});

module.exports = router;

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const env = require('./config/env.config');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const { Article, Category } = require('./models');
const { generateSitemap, generateRSSFeed } = require('./services/seo.service');
const logger = require('./utils/logger');

const app = express();

// Trust proxy for reverse proxy environments (e.g. Google Cloud Run, Nginx)
app.set('trust proxy', 1);

// =============================================
// GZIP COMPRESSION (Item 2 - Compresión)
// =============================================
app.use(compression({
  threshold: 1024, // Only compress responses above 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// =============================================
// SECURITY
// =============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
  xFrameOptions: false,
}));

app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  next();
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// =============================================
// ROOT SEO & CRAWLER ROUTES (Item 4 - Sitemap & RSS)
// =============================================
const handleSitemap = async (req, res) => {
  try {
    const articles = await Article.findAll({
      where: { status: 'published' },
      attributes: ['slug', 'updatedAt', 'publishedAt'],
      order: [['publishedAt', 'DESC']],
    });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const xml = generateSitemap(articles, baseUrl);
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    logger.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
};

const handleRss = async (req, res) => {
  try {
    const articles = await Article.findAll({
      where: { status: 'published' },
      include: [{ model: Category, as: 'category', attributes: ['name'] }],
      attributes: ['title', 'slug', 'excerpt', 'publishedAt', 'createdAt'],
      order: [['publishedAt', 'DESC']],
      limit: 25,
    });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const xml = generateRSSFeed(articles, baseUrl);
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    logger.error('Error generating RSS:', error);
    res.status(500).send('Error generating RSS feed');
  }
};

app.get('/sitemap.xml', handleSitemap);
app.get('/revista/sitemap.xml', handleSitemap);
app.get('/rss.xml', handleRss);
app.get('/feed.xml', handleRss);
app.get('/rss', handleRss);
app.get('/revista/feed.xml', handleRss);
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, '../Front-end/robots.txt'));
});

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intente de nuevo en 15 minutos.',
  },
});

app.use('/api', apiLimiter);

// =============================================
// BODY PARSING
// =============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================
// LOGGING
// =============================================
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

// =============================================
// STATIC FILES WITH CACHING (Item 2 - Compresión & Optimización)
// =============================================
const staticOptions = {
  maxAge: env.NODE_ENV === 'production' ? '1h' : 0,
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    }
  }
};

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions));

// Serve Front-end (with case-safe alias for /components and /Components)
app.use('/components', express.static(path.join(__dirname, '../Front-end/Components'), staticOptions));
app.use('/Components', express.static(path.join(__dirname, '../Front-end/Components'), staticOptions));
app.use(express.static(path.join(__dirname, '../Front-end'), staticOptions));

// Serve Admin Panel
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin'), staticOptions));

// =============================================
// API ROUTES
// =============================================
app.use('/api', routes);

// =============================================
// ERROR HANDLING (Item 10 - 404 Personalizada)
// =============================================
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

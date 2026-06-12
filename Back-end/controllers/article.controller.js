const articleService = require('../services/article.service');
const logger = require('../utils/logger');

// =============================================
// PUBLIC ENDPOINTS
// =============================================

/**
 * GET /api/articles
 * List published articles with pagination
 */
const getPublished = async (req, res, next) => {
  try {
    const { page, limit, category, tag, search, orderBy, orderDir } = req.query;
    const result = await articleService.getPublishedArticles({
      page,
      limit,
      categorySlug: category,
      tagSlug: tag,
      search,
      orderBy,
      orderDir,
    });

    res.json({ success: true, data: result.articles, meta: result.meta });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/articles/featured
 * Get the featured article
 */
const getFeatured = async (req, res, next) => {
  try {
    const article = await articleService.getFeaturedArticle();
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/articles/slug/:slug
 * Get article by slug (increments views)
 */
const getBySlug = async (req, res, next) => {
  try {
    const article = await articleService.getArticleBySlug(req.params.slug);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado.',
      });
    }
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

// =============================================
// ADMIN ENDPOINTS
// =============================================

/**
 * GET /api/admin/articles
 * List all articles (admin)
 */
const getAll = async (req, res, next) => {
  try {
    const { page, limit, status, search } = req.query;
    const result = await articleService.getAllArticles({ page, limit, status, search });
    res.json({ success: true, data: result.articles, meta: result.meta });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/articles/:id
 * Get article by ID (admin)
 */
const getById = async (req, res, next) => {
  try {
    const article = await articleService.getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Artículo no encontrado.',
      });
    }
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/articles
 * Create new article
 */
const create = async (req, res, next) => {
  try {
    const article = await articleService.createArticle(req.body, req.user.id);
    logger.info(`Artículo creado: ${article.title} (por ${req.user.name})`);
    res.status(201).json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/articles/:id
 * Update article
 */
const update = async (req, res, next) => {
  try {
    const article = await articleService.updateArticle(req.params.id, req.body);
    logger.info(`Artículo actualizado: ${article.title}`);
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/articles/:id/publish
 */
const publish = async (req, res, next) => {
  try {
    const article = await articleService.publishArticle(req.params.id);
    logger.info(`Artículo publicado: ${article.title}`);
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/articles/:id/archive
 */
const archive = async (req, res, next) => {
  try {
    const article = await articleService.archiveArticle(req.params.id);
    logger.info(`Artículo archivado: ${article.title}`);
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/articles/:id/featured
 */
const setFeatured = async (req, res, next) => {
  try {
    const article = await articleService.setFeatured(req.params.id);
    logger.info(`Artículo destacado: ${article.title}`);
    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/articles/:id
 */
const remove = async (req, res, next) => {
  try {
    await articleService.deleteArticle(req.params.id);
    logger.info(`Artículo eliminado: ID ${req.params.id}`);
    res.json({ success: true, message: 'Artículo eliminado exitosamente.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublished,
  getFeatured,
  getBySlug,
  getAll,
  getById,
  create,
  update,
  publish,
  archive,
  setFeatured,
  remove,
};

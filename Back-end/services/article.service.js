const { Op } = require('sequelize');
const { Article, Category, Tag, User, ArticleTag } = require('../models');
const { generateUniqueSlug } = require('./slug.service');
const { markdownToHtml, generateExcerpt, calculateReadTime } = require('../utils/formatter');
const { generateMetaTags } = require('./seo.service');
const logger = require('../utils/logger');

/**
 * Create a new article
 */
const createArticle = async (data, authorId) => {
  const slug = await generateUniqueSlug(data.title);
  const contentHtml = markdownToHtml(data.content);
  const excerpt = data.excerpt || generateExcerpt(data.content);
  const readTime = calculateReadTime(data.content);

  // Auto-generate SEO if not provided
  const seo = generateMetaTags({
    title: data.title,
    excerpt,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
  });

  const article = await Article.create({
    title: data.title,
    slug,
    content: data.content,
    contentHtml,
    excerpt,
    featuredImage: data.featuredImage || null,
    thumbnailImage: data.thumbnailImage || null,
    status: data.status || 'draft',
    isFeatured: data.isFeatured || false,
    readTime,
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    publishedAt: data.status === 'published' ? new Date() : null,
    authorId,
    categoryId: data.categoryId || null,
  });

  // Handle tags
  if (data.tags && data.tags.length > 0) {
    await syncArticleTags(article.id, data.tags);
  }

  return getArticleById(article.id);
};

/**
 * Update an existing article
 */
const updateArticle = async (id, data) => {
  const article = await Article.findByPk(id);
  if (!article) throw new Error('Artículo no encontrado');

  const updates = {};

  if (data.title && data.title !== article.title) {
    updates.title = data.title;
    updates.slug = await generateUniqueSlug(data.title, id);
  }

  if (data.content !== undefined) {
    updates.content = data.content;
    updates.contentHtml = markdownToHtml(data.content);
    updates.readTime = calculateReadTime(data.content);
    if (!data.excerpt) {
      updates.excerpt = generateExcerpt(data.content);
    }
  }

  if (data.excerpt !== undefined) updates.excerpt = data.excerpt;
  if (data.featuredImage !== undefined) updates.featuredImage = data.featuredImage;
  if (data.thumbnailImage !== undefined) updates.thumbnailImage = data.thumbnailImage;
  if (data.categoryId !== undefined) updates.categoryId = data.categoryId;
  if (data.status !== undefined) {
    updates.status = data.status;
    if (data.status === 'published' && !article.publishedAt) {
      updates.publishedAt = new Date();
    }
  }

  // SEO
  const seo = generateMetaTags({
    title: data.title || article.title,
    excerpt: data.excerpt || article.excerpt,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
  });
  updates.metaTitle = seo.metaTitle;
  updates.metaDescription = seo.metaDescription;

  await article.update(updates);

  // Handle tags
  if (data.tags !== undefined) {
    await syncArticleTags(id, data.tags || []);
  }

  return getArticleById(id);
};

/**
 * Publish an article
 */
const publishArticle = async (id) => {
  const article = await Article.findByPk(id);
  if (!article) throw new Error('Artículo no encontrado');

  await article.update({
    status: 'published',
    publishedAt: article.publishedAt || new Date(),
  });

  return getArticleById(id);
};

/**
 * Archive an article
 */
const archiveArticle = async (id) => {
  const article = await Article.findByPk(id);
  if (!article) throw new Error('Artículo no encontrado');

  await article.update({ status: 'archived' });
  return getArticleById(id);
};

/**
 * Set an article as featured (unsets previous)
 */
const setFeatured = async (id) => {
  // Remove current featured
  await Article.update({ isFeatured: false }, { where: { isFeatured: true } });

  const article = await Article.findByPk(id);
  if (!article) throw new Error('Artículo no encontrado');

  await article.update({ isFeatured: true });
  return getArticleById(id);
};

/**
 * Get a single article by ID with all relations
 */
const getArticleById = async (id) => {
  return Article.findByPk(id, {
    include: [
      { model: User, as: 'author', attributes: ['id', 'name', 'avatar', 'bio'] },
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'color', 'icon'] },
      { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
    ],
  });
};

/**
 * Get article by slug (public — increments views)
 */
const getArticleBySlug = async (slug) => {
  const article = await Article.findOne({
    where: { slug, status: 'published' },
    include: [
      { model: User, as: 'author', attributes: ['id', 'name', 'avatar', 'bio'] },
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'color', 'icon'] },
      { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
    ],
  });

  if (article) {
    await article.increment('views');
  }

  return article;
};

/**
 * Get published articles with pagination and filters
 */
const getPublishedArticles = async (options = {}) => {
  const {
    page = 1,
    limit = 12,
    categorySlug,
    tagSlug,
    search,
    orderBy = 'publishedAt',
    orderDir = 'DESC',
  } = options;

  const where = { status: 'published' };
  const include = [
    { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
    { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'color', 'icon'] },
    { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
  ];

  // Filter by category
  if (categorySlug) {
    include[1].where = { slug: categorySlug };
    include[1].required = true;
  }

  // Filter by tag
  if (tagSlug) {
    include[2].where = { slug: tagSlug };
    include[2].required = true;
  }

  // Full-text search
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { excerpt: { [Op.like]: `%${search}%` } },
      { content: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Article.findAndCountAll({
    where,
    include,
    order: [[orderBy, orderDir]],
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  return {
    articles: rows,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

/**
 * Get all articles for admin (including drafts)
 */
const getAllArticles = async (options = {}) => {
  const { page = 1, limit = 20, status, search } = options;
  const where = {};

  if (status) where.status = status;
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { excerpt: { [Op.like]: `%${search}%` } },
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Article.findAndCountAll({
    where,
    include: [
      { model: User, as: 'author', attributes: ['id', 'name'] },
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'color'] },
      { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
    ],
    order: [['updatedAt', 'DESC']],
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  return {
    articles: rows,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

/**
 * Get the featured article
 */
const getFeaturedArticle = async () => {
  return Article.findOne({
    where: { isFeatured: true, status: 'published' },
    include: [
      { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'color', 'icon'] },
    ],
  });
};

/**
 * Delete an article
 */
const deleteArticle = async (id) => {
  const article = await Article.findByPk(id);
  if (!article) throw new Error('Artículo no encontrado');

  await ArticleTag.destroy({ where: { article_id: id } });
  await article.destroy();

  return true;
};

/**
 * Sync tags for an article (replace all)
 */
const syncArticleTags = async (articleId, tagIds) => {
  await ArticleTag.destroy({ where: { article_id: articleId } });

  if (tagIds.length > 0) {
    const records = tagIds.map(tagId => ({
      article_id: articleId,
      tag_id: tagId,
    }));
    await ArticleTag.bulkCreate(records);
  }
};

module.exports = {
  createArticle,
  updateArticle,
  publishArticle,
  archiveArticle,
  setFeatured,
  getArticleById,
  getArticleBySlug,
  getPublishedArticles,
  getAllArticles,
  getFeaturedArticle,
  deleteArticle,
};

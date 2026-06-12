const slugify = require('slugify');
const { Category, Article } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db.config');

/**
 * GET /api/categories
 * List all active categories with article count
 */
const getAll = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['name', 'ASC']],
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM articles WHERE articles.category_id = Category.id AND articles.status = "published")'
            ),
            'articleCount',
          ],
        ],
      },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/categories/:slug
 */
const getBySlug = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { slug: req.params.slug },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada.',
      });
    }

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/categories
 */
const create = async (req, res, next) => {
  try {
    const { name, description, color, icon, order } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la categoría es requerido.',
      });
    }

    const slug = slugify(name, { lower: true, strict: true, locale: 'es' });

    const category = await Category.create({
      name,
      slug,
      description: description || null,
      color: color || '#0a2a47',
      icon: icon || 'fas fa-folder',
      order: order || 0,
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/categories/:id
 */
const update = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada.',
      });
    }

    const { name, description, color, icon, order, isActive } = req.body;
    const updates = {};

    if (name !== undefined) {
      updates.name = name;
      updates.slug = slugify(name, { lower: true, strict: true, locale: 'es' });
    }
    if (description !== undefined) updates.description = description;
    if (color !== undefined) updates.color = color;
    if (icon !== undefined) updates.icon = icon;
    if (order !== undefined) updates.order = order;
    if (isActive !== undefined) updates.isActive = isActive;

    await category.update(updates);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/categories/:id
 */
const remove = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada.',
      });
    }

    // Check if articles use this category
    const articleCount = await Article.count({ where: { categoryId: category.id } });
    if (articleCount > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar: ${articleCount} artículos usan esta categoría.`,
      });
    }

    await category.destroy();
    res.json({ success: true, message: 'Categoría eliminada.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getBySlug, create, update, remove };

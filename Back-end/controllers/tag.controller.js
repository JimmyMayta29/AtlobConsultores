const slugify = require('slugify');
const { Tag } = require('../models');
const { Op } = require('sequelize');

/**
 * GET /api/tags
 */
const getAll = async (req, res, next) => {
  try {
    const tags = await Tag.findAll({
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: tags });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tags/search?q=...
 * Autocomplete for tag input
 */
const search = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const tags = await Tag.findAll({
      where: {
        name: { [Op.like]: `%${q}%` },
      },
      limit: 10,
      order: [['name', 'ASC']],
    });

    res.json({ success: true, data: tags });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/tags
 */
const create = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del tag es requerido.',
      });
    }

    const slug = slugify(name, { lower: true, strict: true, locale: 'es' });

    const [tag, created] = await Tag.findOrCreate({
      where: { slug },
      defaults: { name, slug },
    });

    res.status(created ? 201 : 200).json({ success: true, data: tag });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/tags/:id
 */
const remove = async (req, res, next) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag no encontrado.',
      });
    }

    await tag.destroy();
    res.json({ success: true, message: 'Tag eliminado.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, search, create, remove };

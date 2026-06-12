const slugify = require('slugify');
const { Article } = require('../models');

/**
 * Generate a unique URL-safe slug from a title
 * Handles duplicates by appending -2, -3, etc.
 * @param {string} title
 * @param {number|null} excludeId - Article ID to exclude (for updates)
 * @returns {Promise<string>}
 */
const generateUniqueSlug = async (title, excludeId = null) => {
  const baseSlug = slugify(title, {
    lower: true,
    strict: true,
    locale: 'es',
    remove: /[*+~.()'"!:@]/g,
  });

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const where = { slug };
    if (excludeId) {
      const { Op } = require('sequelize');
      where.id = { [Op.ne]: excludeId };
    }

    const existing = await Article.findOne({ where });
    if (!existing) break;

    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
};

module.exports = { generateUniqueSlug };

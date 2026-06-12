const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(300),
    allowNull: false,
    validate: { notEmpty: true, len: [5, 300] },
  },
  slug: {
    type: DataTypes.STRING(350),
    allowNull: false,
    unique: true,
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    comment: 'Raw Markdown content',
  },
  contentHtml: {
    type: DataTypes.TEXT('long'),
    field: 'content_html',
    comment: 'Rendered HTML from Markdown',
  },
  excerpt: {
    type: DataTypes.STRING(500),
    defaultValue: null,
    comment: 'Short summary for cards and SEO',
  },
  featuredImage: {
    type: DataTypes.STRING(500),
    defaultValue: null,
    field: 'featured_image',
  },
  thumbnailImage: {
    type: DataTypes.STRING(500),
    defaultValue: null,
    field: 'thumbnail_image',
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_featured',
  },
  readTime: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    field: 'read_time',
    comment: 'Estimated reading time in minutes',
  },
  // SEO fields
  metaTitle: {
    type: DataTypes.STRING(300),
    defaultValue: null,
    field: 'meta_title',
  },
  metaDescription: {
    type: DataTypes.STRING(500),
    defaultValue: null,
    field: 'meta_description',
  },
  views: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
  },
  publishedAt: {
    type: DataTypes.DATE,
    defaultValue: null,
    field: 'published_at',
  },
  // Foreign keys defined in associations
  authorId: {
    type: DataTypes.INTEGER.UNSIGNED,
    field: 'author_id',
  },
  categoryId: {
    type: DataTypes.INTEGER.UNSIGNED,
    field: 'category_id',
  },
}, {
  tableName: 'articles',
  indexes: [
    { fields: ['status'] },
    { fields: ['category_id'] },
    { fields: ['author_id'] },
    { fields: ['published_at'] },
    { fields: ['is_featured'] },
    { type: 'FULLTEXT', fields: ['title', 'content'] },
  ],
});

module.exports = Article;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  originalName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'original_name',
  },
  mimeType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'mime_type',
  },
  size: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    comment: 'File size in bytes',
  },
  path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Relative path from uploads/',
  },
  thumbnailPath: {
    type: DataTypes.STRING(500),
    defaultValue: null,
    field: 'thumbnail_path',
  },
  alt: {
    type: DataTypes.STRING(255),
    defaultValue: null,
    comment: 'Alt text for accessibility and SEO',
  },
  articleId: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: null,
    field: 'article_id',
  },
  uploadedBy: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: null,
    field: 'uploaded_by',
  },
}, {
  tableName: 'media',
});

module.exports = Media;

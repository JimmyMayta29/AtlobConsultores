const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const ArticleTag = sequelize.define('ArticleTag', {
  articleId: {
    type: DataTypes.INTEGER.UNSIGNED,
    field: 'article_id',
    primaryKey: true,
  },
  tagId: {
    type: DataTypes.INTEGER.UNSIGNED,
    field: 'tag_id',
    primaryKey: true,
  },
}, {
  tableName: 'article_tags',
  timestamps: false,
});

module.exports = ArticleTag;

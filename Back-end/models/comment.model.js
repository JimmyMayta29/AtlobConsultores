const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  authorName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'author_name',
    validate: { notEmpty: true },
  },
  authorEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'author_email',
    validate: { isEmail: true },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { notEmpty: true, len: [3, 5000] },
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_approved',
  },
  articleId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'article_id',
  },
  parentId: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: null,
    field: 'parent_id',
    comment: 'For nested replies',
  },
}, {
  tableName: 'comments',
});

module.exports = Comment;

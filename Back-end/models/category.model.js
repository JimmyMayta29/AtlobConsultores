const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true },
  },
  slug: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: null,
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#0a2a47',
    comment: 'HEX color for badge/tag display',
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: 'fas fa-folder',
    comment: 'FontAwesome class',
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'categories',
});

module.exports = Category;

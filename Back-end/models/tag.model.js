const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Tag = sequelize.define('Tag', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true },
  },
  slug: {
    type: DataTypes.STRING(80),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'tags',
});

module.exports = Tag;

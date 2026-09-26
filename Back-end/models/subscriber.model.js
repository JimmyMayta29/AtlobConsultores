const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Subscriber = sequelize.define('Subscriber', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true, notEmpty: true },
  },
  status: {
    type: DataTypes.ENUM('active', 'unsubscribed'),
    defaultValue: 'active',
  },
  source: {
    type: DataTypes.STRING(50),
    defaultValue: 'footer_form',
  },
}, {
  tableName: 'subscribers',
  timestamps: true,
  underscored: true,
});

module.exports = Subscriber;

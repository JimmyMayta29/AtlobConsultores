const { Sequelize } = require('sequelize');
const env = require('./env.config');
const logger = require('../utils/logger');

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'mysql',
  logging: env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  timezone: '-05:00', // Peru UTC-5
  define: {
    timestamps: true,
    underscored: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

/**
 * Test connection and sync models
 * @param {boolean} force - Drop and recreate tables (DANGEROUS in production)
 */
const connectDB = async (force = false) => {
  try {
    await sequelize.authenticate();
    logger.info('✅ MySQL conectado exitosamente');

    // Sync all models
    await sequelize.sync({ alter: env.NODE_ENV === 'development', force });
    logger.info('✅ Modelos sincronizados');
  } catch (error) {
    logger.error('❌ Error de conexión MySQL:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

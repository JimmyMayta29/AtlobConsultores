const app = require('./app');
const env = require('./config/env.config');
const { connectDB } = require('./config/db.config');
const { ensureUploadDirs } = require('./services/upload.service');
const logger = require('./utils/logger');

// Load models + associations
require('./models');

const startServer = async () => {
  try {
    // 1. Ensure upload directories exist
    await ensureUploadDirs();
    logger.info('📁 Directorios de uploads verificados');

    // 2. Connect to database and sync models
    await connectDB();

    // 3. Run initial seeder if needed
    const { runSeeder } = require('./database/seeders/initial.seeder');
    await runSeeder();

    // 4. Start HTTP server
    app.listen(env.PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════╗
║                                              ║
║   🚀 ATLOB Backend v1.0                     ║
║   Servidor: http://localhost:${env.PORT}          ║
║   API:      http://localhost:${env.PORT}/api      ║
║   Admin:    http://localhost:${env.PORT}/admin     ║
║   Entorno:  ${env.NODE_ENV.padEnd(33)}║
║                                              ║
╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Error fatal al iniciar servidor:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

startServer();

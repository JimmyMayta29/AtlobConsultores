const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Must be registered LAST in Express middleware chain
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, {
    stack: err.stack,
    body: req.body,
    user: req.user ? req.user.id : 'anonymous',
  });

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors ? err.errors.map(e => ({
      field: e.path,
      message: e.message,
    })) : [];

    return res.status(400).json({
      success: false,
      message: 'Error de validación en los datos.',
      errors,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación inválido o expirado.',
    });
  }

  // Custom app errors with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Default 500
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor.'
      : err.message,
  });
};

const path = require('path');

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  // If request is asking for HTML and not an API endpoint, serve branded 404 page
  if (req.accepts('html') && !req.originalUrl.startsWith('/api/')) {
    const page404 = path.join(__dirname, '../../Front-end/404.html');
    return res.status(404).sendFile(page404);
  }

  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFoundHandler };

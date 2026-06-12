require('dotenv').config();

module.exports = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5500',

  // Database
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 3306,
  DB_NAME: process.env.DB_NAME || 'atlob_cms',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASS: process.env.DB_PASS || '',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_not_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // Uploads
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,

  // SMTP
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'Consultoría ATLOB <noreply@atlob.com>',

  // Admin defaults
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@atlob.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Atlob2026!',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Administrador ATLOB',
};

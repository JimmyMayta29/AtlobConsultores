const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const env = require('./config/env.config');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');
const logger = require('./utils/logger');

const app = express();

// =============================================
// SECURITY
// =============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
  xFrameOptions: false,
}));

app.use((req, res, next) => {
  res.removeHeader('X-Frame-Options');
  next();
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intente de nuevo en 15 minutos.',
  },
});

app.use('/api', apiLimiter);

// =============================================
// BODY PARSING
// =============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================
// LOGGING
// =============================================
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

// =============================================
// STATIC FILES
// =============================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Front-end
app.use(express.static(path.join(__dirname, '../Front-end')));

// Serve Admin Panel
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// =============================================
// API ROUTES
// =============================================
app.use('/api', routes);

// =============================================
// ERROR HANDLING
// =============================================
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

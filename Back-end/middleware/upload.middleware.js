const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const uploadConfig = require('../config/upload.config');

/**
 * Storage configuration for article images
 */
const articleStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadConfig.articlesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `art_${Date.now()}_${uniqueSuffix}${ext}`);
  },
});

/**
 * File filter — only allow permitted mime types
 */
const fileFilter = (req, file, cb) => {
  if (uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

/**
 * Multer instance for article images
 */
const uploadArticleImage = multer({
  storage: articleStorage,
  fileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
  },
});

/**
 * Error handler for multer errors
 */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `El archivo excede el tamaño máximo de ${uploadConfig.maxFileSize / (1024 * 1024)}MB.`,
      });
    }
    return res.status(400).json({
      success: false,
      message: `Error de upload: ${err.message}`,
    });
  }

  if (err && err.message.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};

module.exports = { uploadArticleImage, handleMulterError };

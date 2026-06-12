const path = require('path');
const env = require('./env.config');

module.exports = {
  // Base directory for all uploads
  uploadDir: path.resolve(__dirname, '..', env.UPLOAD_DIR),

  // Sub-directories
  articlesDir: path.resolve(__dirname, '..', env.UPLOAD_DIR, 'articles'),
  thumbnailsDir: path.resolve(__dirname, '..', env.UPLOAD_DIR, 'thumbnails'),

  // Constraints
  maxFileSize: env.MAX_FILE_SIZE,
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
  ],

  // Thumbnail settings
  thumbnail: {
    width: 400,
    height: 300,
    quality: 80,
    format: 'webp',
  },
};

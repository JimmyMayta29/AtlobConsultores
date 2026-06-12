const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const uploadConfig = require('../config/upload.config');
const logger = require('../utils/logger');

/**
 * Ensure upload directories exist
 */
const ensureUploadDirs = async () => {
  const dirs = [uploadConfig.uploadDir, uploadConfig.articlesDir, uploadConfig.thumbnailsDir];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
};

/**
 * Process an uploaded image: generate WebP thumbnail
 * @param {string} originalPath - Path to the uploaded original file
 * @param {string} filename - Original filename (without extension)
 * @returns {Promise<string|null>} Thumbnail relative path or null
 */
const processImage = async (originalPath, filename) => {
  try {
    const thumbFilename = `thumb_${filename}.webp`;
    const thumbPath = path.join(uploadConfig.thumbnailsDir, thumbFilename);
    const { width, height, quality } = uploadConfig.thumbnail;

    await sharp(originalPath)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .webp({ quality })
      .toFile(thumbPath);

    logger.info(`Thumbnail generado: ${thumbFilename}`);
    return `thumbnails/${thumbFilename}`;
  } catch (error) {
    logger.error('Error generando thumbnail:', error.message);
    return null;
  }
};

/**
 * Delete a file from the uploads directory
 * @param {string} relativePath - Path relative to uploads/
 */
const deleteFile = async (relativePath) => {
  if (!relativePath) return;
  try {
    const fullPath = path.join(uploadConfig.uploadDir, relativePath);
    await fs.access(fullPath);
    await fs.unlink(fullPath);
    logger.info(`Archivo eliminado: ${relativePath}`);
  } catch (error) {
    logger.warn(`No se pudo eliminar ${relativePath}: ${error.message}`);
  }
};

/**
 * Delete media files (original + thumbnail)
 * @param {Object} media - Media model instance
 */
const deleteMediaFiles = async (media) => {
  await deleteFile(media.path);
  if (media.thumbnailPath) {
    await deleteFile(media.thumbnailPath);
  }
};

module.exports = { ensureUploadDirs, processImage, deleteFile, deleteMediaFiles };

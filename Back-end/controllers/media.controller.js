const path = require('path');
const { Media } = require('../models');
const { processImage, deleteMediaFiles } = require('../services/upload.service');
const uploadConfig = require('../config/upload.config');
const logger = require('../utils/logger');

/**
 * POST /api/admin/media/upload
 * Upload a single file
 */
const upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se recibió ningún archivo.',
      });
    }

    const file = req.file;
    const relativePath = `articles/${file.filename}`;

    // Generate thumbnail for images
    let thumbnailPath = null;
    if (file.mimetype.startsWith('image/')) {
      const filenameNoExt = path.parse(file.filename).name;
      thumbnailPath = await processImage(file.path, filenameNoExt);
    }

    // Save to database
    const media = await Media.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: relativePath,
      thumbnailPath,
      alt: req.body.alt || null,
      articleId: req.body.articleId || null,
      uploadedBy: req.user.id,
    });

    logger.info(`Media subido: ${file.originalname} (${(file.size / 1024).toFixed(1)}KB)`);

    res.status(201).json({
      success: true,
      data: {
        ...media.toJSON(),
        url: `/uploads/${relativePath}`,
        thumbnailUrl: thumbnailPath ? `/uploads/${thumbnailPath}` : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/media
 * List all media files
 */
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 24 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Media.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

    const data = rows.map(m => ({
      ...m.toJSON(),
      url: `/uploads/${m.path}`,
      thumbnailUrl: m.thumbnailPath ? `/uploads/${m.thumbnailPath}` : null,
    }));

    res.json({
      success: true,
      data,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/media/:id
 */
const remove = async (req, res, next) => {
  try {
    const media = await Media.findByPk(req.params.id);
    if (!media) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado.',
      });
    }

    await deleteMediaFiles(media);
    await media.destroy();

    logger.info(`Media eliminado: ${media.originalName}`);
    res.json({ success: true, message: 'Archivo eliminado.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, getAll, remove };

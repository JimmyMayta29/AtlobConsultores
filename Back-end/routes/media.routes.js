const router = require('express').Router();
const mediaController = require('../controllers/media.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const { uploadArticleImage, handleMulterError } = require('../middleware/upload.middleware');

// Public — list media
router.get('/', mediaController.getAll);

// Admin — upload
router.post(
  '/upload',
  authenticate,
  requireAdmin,
  uploadArticleImage.single('file'),
  handleMulterError,
  mediaController.upload
);

// Admin — delete
router.delete('/:id', authenticate, requireAdmin, mediaController.remove);

module.exports = router;

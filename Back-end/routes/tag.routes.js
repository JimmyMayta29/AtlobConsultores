const router = require('express').Router();
const tagController = require('../controllers/tag.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

// Public
router.get('/', tagController.getAll);
router.get('/search', tagController.search);

// Admin
router.post('/', authenticate, requireAdmin, tagController.create);
router.delete('/:id', authenticate, requireAdmin, tagController.remove);

module.exports = router;

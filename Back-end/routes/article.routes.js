const router = require('express').Router();
const articleController = require('../controllers/article.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

// =============================================
// PUBLIC ROUTES
// =============================================
router.get('/', articleController.getPublished);
router.get('/featured', articleController.getFeatured);
router.get('/slug/:slug', articleController.getBySlug);

// =============================================
// ADMIN ROUTES (prefixed by /api/admin/articles in index)
// =============================================
router.get('/admin', authenticate, requireAdmin, articleController.getAll);
router.get('/admin/:id', authenticate, requireAdmin, articleController.getById);
router.post('/admin', authenticate, requireAdmin, articleController.create);
router.put('/admin/:id', authenticate, requireAdmin, articleController.update);
router.patch('/admin/:id/publish', authenticate, requireAdmin, articleController.publish);
router.patch('/admin/:id/archive', authenticate, requireAdmin, articleController.archive);
router.patch('/admin/:id/featured', authenticate, requireAdmin, articleController.setFeatured);
router.delete('/admin/:id', authenticate, requireAdmin, articleController.remove);

module.exports = router;

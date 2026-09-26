const router = require('express').Router();
const newsletterController = require('../controllers/newsletter.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

// Public route: Subscribe to newsletter
router.post('/subscribe', newsletterController.subscribe);

// Admin route: View subscribers
router.get('/subscribers', authenticate, requireAdmin, newsletterController.getSubscribers);

module.exports = router;

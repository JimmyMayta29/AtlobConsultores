const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireStrictAdmin } = require('../middleware/admin.middleware');

// Public
router.post('/login', authController.login);

// Authenticated
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);

// Admin only — create new users
router.post('/register', authenticate, requireStrictAdmin, authController.register);

module.exports = router;

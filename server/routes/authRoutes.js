const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', requireAuth, authController.getCurrentUser);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.put('/update-password', requireAuth, authController.updatePassword);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validateIdParam } = require('../middleware/validation');

router.get('/:id', validateIdParam('id'), optionalAuth, userController.getUserProfile);
router.put('/profile', requireAuth, userController.updateProfile);

module.exports = router;

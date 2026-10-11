const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');
const { validateIdParam } = require('../middleware/validation');

router.get('/', requireAuth, notificationController.getNotifications);
router.put('/read-all', requireAuth, notificationController.markAllAsRead);
router.put('/:id/read', validateIdParam('id'), requireAuth, notificationController.markAsRead);

module.exports = router;

const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validateIdParam } = require('../middleware/validation');

router.get('/me', requireAuth, requireRole('organization'), orgController.getMyOrgProfile);
router.put('/me', requireAuth, requireRole('organization'), orgController.updateMyOrgProfile);
router.post('/verify-request', requireAuth, requireRole('organization'), orgController.submitVerificationRequest);
router.get('/dashboard-metrics', requireAuth, requireRole('organization'), orgController.getOrgDashboardMetrics);
router.get('/:id', validateIdParam('id'), orgController.getPublicOrgProfile);

module.exports = router;

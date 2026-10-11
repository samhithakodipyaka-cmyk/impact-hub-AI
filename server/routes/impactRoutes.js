const express = require('express');
const router = express.Router();
const impactController = require('../controllers/impactController');
const { requireAuth } = require('../middleware/auth');

router.get('/my-dashboard', requireAuth, impactController.getIndividualImpactDashboard);
router.get('/platform-overview', impactController.getPlatformPublicImpact);

module.exports = router;

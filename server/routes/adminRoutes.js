const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validateIdParam } = require('../middleware/validation');

// Guard all admin routes with authentication and strict admin role verification
router.use(requireAuth, requireRole('admin'));

router.get('/overview', adminController.getAdminOverview);
router.get('/organizations', adminController.getOrganizations);
router.put('/organizations/:id/verify', validateIdParam('id'), adminController.verifyOrganization);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', validateIdParam('id'), adminController.updateUserStatus);
router.get('/reports', adminController.getReports);
router.put('/reports/:id/resolve', validateIdParam('id'), adminController.resolveReport);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;

const express = require('express');
const router = express.Router();
const initiativeController = require('../controllers/initiativeController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validateIdParam } = require('../middleware/validation');

router.get('/', initiativeController.getInitiatives);
router.get('/my-org', requireAuth, requireRole('organization'), initiativeController.getMyOrgInitiatives);
router.get('/:id', validateIdParam('id'), optionalAuth, initiativeController.getInitiativeById);
router.post('/', requireAuth, requireRole('organization', 'admin'), initiativeController.createInitiative);
router.put('/:id', validateIdParam('id'), requireAuth, requireRole('organization', 'admin'), initiativeController.updateInitiative);

module.exports = router;

const express = require('express');
const router = express.Router();
const participationController = require('../controllers/participationController');
const { requireAuth } = require('../middleware/auth');
const { validateIdParam } = require('../middleware/validation');

router.post('/:initiativeId/join', validateIdParam('initiativeId'), requireAuth, participationController.joinInitiative);
router.post('/:id/cancel', validateIdParam('id'), requireAuth, participationController.cancelParticipation);
router.post('/:id/submit-evidence', validateIdParam('id'), requireAuth, participationController.submitEvidence);
router.post('/:id/verify', validateIdParam('id'), requireAuth, participationController.verifyParticipation);
router.get('/my', requireAuth, participationController.getMyActivities);
router.get('/initiative/:initiativeId', validateIdParam('initiativeId'), requireAuth, participationController.getInitiativeParticipants);

module.exports = router;

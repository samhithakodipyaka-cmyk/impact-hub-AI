const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalAuth, requireAuth } = require('../middleware/auth');

router.get('/recommendations', optionalAuth, aiController.getRecommendations);
router.post('/what-can-i-do', optionalAuth, aiController.handleWhatCanIDo);
router.post('/occasion-ideas', aiController.handleOccasionIdeas);
router.get('/gap-insights', aiController.handleGapInsights);
router.post('/assist-draft', requireAuth, aiController.handleAssistDraft);

module.exports = router;

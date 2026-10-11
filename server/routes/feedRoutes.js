const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validateIdParam } = require('../middleware/validation');

router.get('/', optionalAuth, feedController.getFeedPosts);
router.post('/', requireAuth, feedController.createPost);
router.post('/:id/like', validateIdParam('id'), requireAuth, feedController.toggleLike);
router.post('/:id/comment', validateIdParam('id'), requireAuth, feedController.addComment);
router.get('/:id/comments', validateIdParam('id'), feedController.getPostComments);
router.post('/follow/:targetId', validateIdParam('targetId'), requireAuth, feedController.toggleFollow);

module.exports = router;

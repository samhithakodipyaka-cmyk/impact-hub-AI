const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const { createNotification } = require('../services/notificationService');
const { isValidHttpUrl } = require('../utils/validators');

/**
 * Get community feed posts
 */
const getFeedPosts = async (req, res, next) => {
  try {
    const { cause, page = 1, limit = 10 } = req.query;

    const query = {};
    if (cause && cause !== 'All Causes') {
      query.causeCategory = cause;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name role avatarUrl verifiedStats')
      .populate('initiative', 'title causeCategory')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const currentUserId = req.user?._id?.toString();

    const formatted = posts.map((p) => ({
      ...p,
      isLiked: currentUserId && Array.isArray(p.likes)
        ? p.likes.some((id) => id.toString() === currentUserId)
        : false,
    }));

    res.json({
      success: true,
      posts: formatted,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new Post
 */
const createPost = async (req, res, next) => {
  try {
    const { content, mediaUrl, causeCategory, initiativeId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content cannot be empty.' });
    }

    if (mediaUrl && !isValidHttpUrl(mediaUrl)) {
      return res.status(400).json({
        success: false,
        message: 'Media URL must be a valid http or https web address.',
      });
    }

    const post = new Post({
      author: req.user._id,
      authorRole: req.user.role,
      content: content.trim(),
      mediaUrl: mediaUrl ? mediaUrl.trim() : '',
      causeCategory: causeCategory || 'General',
      initiative: initiativeId || null,
    });

    await post.save();
    await post.populate('author', 'name role avatarUrl verifiedStats');

    res.status(201).json({
      success: true,
      message: 'Post created successfully.',
      post,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle Like on Post
 */
const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const hasLiked = post.likes.some((l) => l.toString() === userId.toString());

    if (hasLiked) {
      post.likes = post.likes.filter((l) => l.toString() !== userId.toString());
      post.likesCount = Math.max(0, post.likes.length);
    } else {
      post.likes.push(userId);
      post.likesCount = post.likes.length;

      // Notify post author if not self
      if (post.author.toString() !== userId.toString()) {
        await createNotification({
          recipientId: post.author,
          title: 'New Like on your Post',
          message: `${req.user.name} liked your community update.`,
          type: 'social',
          link: '/feed',
        });
      }
    }

    await post.save();

    res.json({
      success: true,
      isLiked: !hasLiked,
      likesCount: post.likesCount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Add Comment
 */
const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty.' });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comment = new Comment({
      post: id,
      author: req.user._id,
      content: content.trim(),
    });

    await comment.save();
    await comment.populate('author', 'name role avatarUrl');

    post.commentsCount += 1;
    await post.save();

    // Notify author
    if (post.author.toString() !== req.user._id.toString()) {
      await createNotification({
        recipientId: post.author,
        title: 'New Comment on your Post',
        message: `${req.user.name} commented: "${content.trim().slice(0, 50)}..."`,
        type: 'social',
        link: '/feed',
      });
    }

    res.status(201).json({
      success: true,
      comment,
      commentsCount: post.commentsCount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get comments for a post
 */
const getPostComments = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comments = await Comment.find({ post: id })
      .populate('author', 'name role avatarUrl')
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      comments,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle follow/unfollow a user or organization owner
 */
const toggleFollow = async (req, res, next) => {
  try {
    const { targetId } = req.params;
    const userId = req.user._id;

    if (targetId.toString() === userId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself.' });
    }

    const existing = await Follow.findOne({ follower: userId, target: targetId });

    if (existing) {
      await Follow.deleteOne({ _id: existing._id });
      return res.json({ success: true, isFollowing: false, message: 'Unfollowed successfully.' });
    }

    await Follow.create({ follower: userId, target: targetId });

    // Notify target
    await createNotification({
      recipientId: targetId,
      title: 'New Follower',
      message: `${req.user.name} is now following your social impact journey.`,
      type: 'social',
      link: `/users/${userId}`,
    });

    res.json({ success: true, isFollowing: true, message: 'Now following!' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getFeedPosts,
  createPost,
  toggleLike,
  addComment,
  getPostComments,
  toggleFollow,
};

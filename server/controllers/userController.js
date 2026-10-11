const User = require('../models/User');
const Post = require('../models/Post');
const ImpactRecord = require('../models/ImpactRecord');
const Follow = require('../models/Follow');
const { isValidHttpUrl } = require('../utils/validators');

/**
 * Get Public User Profile
 */
const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Fetch user recent verified contributions
    const recentImpact = await ImpactRecord.find({ user: id })
      .populate('initiative', 'title causeCategory')
      .populate('organization', 'name')
      .sort({ verifiedAt: -1 })
      .limit(5)
      .lean();

    // Check if current user is following this profile
    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({ follower: req.user._id, target: id });
      isFollowing = !!follow;
    }

    const followersCount = await Follow.countDocuments({ target: id });
    const followingCount = await Follow.countDocuments({ follower: id });

    res.json({
      success: true,
      user: user.toSafeObject(),
      recentImpact,
      stats: {
        ...user.verifiedStats,
        followersCount,
        followingCount,
      },
      isFollowing,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Current User Profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatarUrl, bio, location, skills, interests, availability } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (avatarUrl !== undefined) {
      if (avatarUrl && !isValidHttpUrl(avatarUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Avatar URL must be a valid http or https web address.',
        });
      }
      user.avatarUrl = avatarUrl.trim();
    }

    if (bio !== undefined) user.bio = bio.trim();
    if (location) {
      user.location = {
        city: location.city ? location.city.trim() : user.location.city,
        state: location.state ? location.state.trim() : user.location.state,
        country: location.country ? location.country.trim() : user.location.country,
        lat: location.lat !== undefined ? location.lat : user.location.lat,
        lng: location.lng !== undefined ? location.lng : user.location.lng,
      };
    }

    if (Array.isArray(skills)) user.skills = skills.map((s) => s.trim()).filter(Boolean);
    if (Array.isArray(interests)) user.interests = interests.map((i) => i.trim()).filter(Boolean);
    if (availability) {
      user.availability = {
        weekdays: !!availability.weekdays,
        weekends: !!availability.weekends,
        mornings: !!availability.mornings,
        afternoons: !!availability.afternoons,
        evenings: !!availability.evenings,
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
};

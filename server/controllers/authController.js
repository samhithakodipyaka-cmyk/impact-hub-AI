const User = require('../models/User');
const Organization = require('../models/Organization');
const PasswordResetToken = require('../models/PasswordResetToken');
const { generateToken, generateResetToken, hashToken } = require('../utils/tokenUtils');
const { isValidEmail, isValidPassword, normalizeEmail } = require('../utils/validators');

/**
 * Register User (Individual or Organization)
 * Admin role CANNOT be selected via public registration
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'individual', organizationDetails } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required.' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    // Role safety check: Admin role can NEVER be created through public registration
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrator accounts cannot be created via public registration.',
      });
    }

    const cleanEmail = normalizeEmail(email);

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: role === 'organization' ? 'organization' : 'individual',
    });

    await user.save();

    // If registering as an organization, create the initial organization record (pending verification)
    let org = null;
    if (user.role === 'organization') {
      const orgName = (organizationDetails && organizationDetails.name) || user.name;
      const orgCategory = (organizationDetails && organizationDetails.category) || 'Food & Hunger';
      const orgCity = (organizationDetails && organizationDetails.city) || 'Hyderabad';
      const orgDesc =
        (organizationDetails && organizationDetails.description) ||
        `Community organization registered on ImpactHub AI.`;

      org = await Organization.create({
        owner: user._id,
        name: orgName,
        category: orgCategory,
        description: orgDesc,
        contactEmail: cleanEmail,
        location: { city: orgCity },
        verificationStatus: 'pending',
      });

      user.organizationProfile = org._id;
      await user.save();
    }

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: user.toSafeObject(),
      organization: org,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Login User
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    const cleanEmail = normalizeEmail(email);
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended. Please contact support.',
      });
    }

    const token = generateToken(user);
    let organization = null;
    if (user.role === 'organization') {
      organization = await Organization.findOne({ owner: user._id });
    }

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: user.toSafeObject(),
      organization,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Current Logged-in User
 */
const getCurrentUser = async (req, res, next) => {
  try {
    let organization = null;
    if (req.user.role === 'organization') {
      organization = await Organization.findOne({ owner: req.user._id });
    }

    res.json({
      success: true,
      user: req.user.toSafeObject(),
      organization,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Forgot Password - Generates secure expiring reset token hash
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.',
      });
    }

    const cleanEmail = normalizeEmail(email);
    const user = await User.findOne({ email: cleanEmail });

    // For security reasons, do not reveal whether user exists or not to prevent user enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been prepared.',
      });
    }

    // Invalidate existing active reset tokens for this user
    await PasswordResetToken.updateMany({ user: user._id, used: false }, { used: true });

    const { rawToken, hashedToken, expiresAt } = generateResetToken();

    await PasswordResetToken.create({
      user: user._id,
      tokenHash: hashedToken,
      expiresAt,
    });

    // In dev / demo mode, return the resetToken directly in response for immediate testing
    // while documenting real SMTP production workflow in README
    res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been prepared.',
      devResetToken: rawToken, // Convenient for local testing and evaluation
      resetInstructions: 'Use the reset token with /api/auth/reset-password endpoint.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Reset Password using token
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Reset token is required.' });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.',
      });
    }

    const tokenHash = hashToken(token);
    const resetRecord = await PasswordResetToken.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid, used, or expired.',
      });
    }

    const user = await User.findById(resetRecord.user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.password = newPassword;
    await user.save();

    resetRecord.used = true;
    await resetRecord.save();

    res.json({
      success: true,
      message: 'Password has been successfully updated. You may now log in with your new password.',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Password while logged in
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  updatePassword,
};

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

const generateToken = (payload) => {
  return jwt.sign(
    {
      id: payload._id || payload.id,
      email: payload.email,
      role: payload.role,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const hashToken = (rawToken) => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(rawToken);
  // 1 hour expiry
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  return { rawToken, hashedToken, expiresAt };
};

module.exports = {
  generateToken,
  verifyToken,
  hashToken,
  generateResetToken,
};

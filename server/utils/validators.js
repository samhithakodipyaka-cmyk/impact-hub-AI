const validator = require('validator');
const mongoose = require('mongoose');

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  return validator.normalizeEmail(email.trim().toLowerCase()) || email.trim().toLowerCase();
};

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return validator.isEmail(email.trim());
};

const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  // At least 8 characters
  return password.length >= 8;
};

const isValidHttpUrl = (urlString) => {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const parsed = new URL(urlString.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.trim();
};

module.exports = {
  isValidObjectId,
  normalizeEmail,
  isValidEmail,
  isValidPassword,
  isValidHttpUrl,
  sanitizeText,
};

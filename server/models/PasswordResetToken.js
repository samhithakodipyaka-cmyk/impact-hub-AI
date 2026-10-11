const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically purge expired tokens after 24 hours
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

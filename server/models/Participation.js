const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    initiative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Initiative',
      required: true,
      index: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled', 'completed'],
      default: 'registered',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
      index: true,
    },
    hoursClaimed: {
      type: Number,
      default: 0,
      min: 0,
      max: 24,
    },
    peopleReachedClaimed: {
      type: Number,
      default: 0,
      min: 0,
    },
    evidenceNotes: {
      type: String,
      default: '',
      maxlength: [2000, 'Evidence notes cannot exceed 2000 characters'],
    },
    evidenceUrls: {
      type: [String],
      default: [],
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
    impactRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ImpactRecord',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate registrations for the same initiative
participationSchema.index({ user: 1, initiative: 1 }, { unique: true });

module.exports = mongoose.model('Participation', participationSchema);

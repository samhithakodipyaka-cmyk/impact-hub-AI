const mongoose = require('mongoose');

const impactRecordSchema = new mongoose.Schema(
  {
    participation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Participation',
      required: true,
      unique: true, // One authoritative impact record per participation
      index: true,
    },
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
    causeCategory: {
      type: String,
      required: true,
      index: true,
    },
    contributionType: {
      type: String,
      enum: ['field_volunteering', 'skill_based', 'organizer', 'emergency_response', 'community_advocate'],
      default: 'field_volunteering',
    },
    verifiedHours: {
      type: Number,
      required: true,
      min: [0.1, 'Verified hours must be greater than zero'],
      max: [24, 'Cannot verify more than 24 hours per activity'],
    },
    peopleReached: {
      type: Number,
      default: 0,
      min: 0,
    },
    outcomeSummary: {
      type: String,
      required: true,
      maxlength: [1000, 'Outcome summary cannot exceed 1000 characters'],
    },
    evidenceUrls: {
      type: [String],
      default: [],
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

impactRecordSchema.index({ user: 1, causeCategory: 1 });
impactRecordSchema.index({ organization: 1, verifiedAt: -1 });

module.exports = mongoose.model('ImpactRecord', impactRecordSchema);

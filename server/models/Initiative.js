const mongoose = require('mongoose');

const initiativeSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Initiative title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Initiative description is required'],
      maxlength: [4000, 'Description cannot exceed 4000 characters'],
    },
    causeCategory: {
      type: String,
      required: [true, 'Cause category is required'],
      enum: [
        'Food & Hunger',
        'Environment & Nature',
        'Education & Literacy',
        'Healthcare & Blood Donation',
        'Animal Welfare',
        'Community Cleanup',
        'Disaster Relief',
        'Civic Engagement',
        'Other',
      ],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    startTime: {
      type: String,
      default: '09:00 AM',
      trim: true,
    },
    endTime: {
      type: String,
      default: '12:00 PM',
      trim: true,
    },
    estimatedHours: {
      type: Number,
      default: 3,
      min: [0.5, 'Estimated hours must be at least 0.5'],
      max: [24, 'Single activity hours cannot exceed 24'],
    },
    location: {
      venue: { type: String, default: '', trim: true },
      address: { type: String, default: '', trim: true },
      city: { type: String, required: [true, 'City is required'], trim: true, index: true },
      state: { type: String, default: '', trim: true },
      country: { type: String, default: 'India', trim: true },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      isVirtual: { type: Boolean, default: false },
    },
    requiredSkills: {
      type: [String],
      default: [],
      index: true,
    },
    volunteerCapacity: {
      type: Number,
      required: [true, 'Volunteer capacity is required'],
      min: [1, 'Capacity must be at least 1'],
      max: [5000, 'Capacity exceeds maximum limit'],
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
      default: 'published',
      index: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    preparationChecklist: {
      type: [String],
      default: [],
    },
    targetOutcomes: {
      type: [String],
      default: [],
    },
    isAiGeneratedDraft: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

initiativeSchema.index({
  title: 'text',
  description: 'text',
  'location.city': 1,
  causeCategory: 1,
  startDate: 1,
});

module.exports = mongoose.model('Initiative', initiativeSchema);

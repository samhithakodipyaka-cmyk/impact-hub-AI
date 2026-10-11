const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Organization description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
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
    location: {
      address: { type: String, default: '', trim: true },
      city: { type: String, required: [true, 'City is required'], trim: true },
      state: { type: String, default: '', trim: true },
      country: { type: String, default: 'India', trim: true },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '',
      trim: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    registrationNumber: {
      type: String,
      default: '',
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    verificationNotes: {
      type: String,
      default: '',
    },
    submittedDocuments: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
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
    },
    metrics: {
      totalInitiatives: { type: Number, default: 0, min: 0 },
      activeVolunteers: { type: Number, default: 0, min: 0 },
      verifiedImpactHours: { type: Number, default: 0, min: 0 },
    },
  },
  {
    timestamps: true,
  }
);

organizationSchema.index({ name: 'text', description: 'text', 'location.city': 1 });

module.exports = mongoose.model('Organization', organizationSchema);

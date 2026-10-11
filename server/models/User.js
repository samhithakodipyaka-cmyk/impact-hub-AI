const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return by default
    },
    role: {
      type: String,
      enum: ['individual', 'organization', 'admin'],
      default: 'individual',
      index: true,
    },
    avatarUrl: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      city: { type: String, default: '', trim: true },
      state: { type: String, default: '', trim: true },
      country: { type: String, default: 'India', trim: true },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
      index: true,
    },
    interests: {
      type: [String],
      default: [],
      index: true,
    },
    availability: {
      weekdays: { type: Boolean, default: false },
      weekends: { type: Boolean, default: true },
      mornings: { type: Boolean, default: true },
      afternoons: { type: Boolean, default: false },
      evenings: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      index: true,
    },
    badges: [
      {
        badgeId: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String, default: '' },
        icon: { type: String, default: 'award' },
        awardedAt: { type: Date, default: Date.now },
      },
    ],
    verifiedStats: {
      hours: { type: Number, default: 0, min: 0 },
      activitiesCount: { type: Number, default: 0, min: 0 },
      causesCount: { type: Number, default: 0, min: 0 },
      peopleReached: { type: Number, default: 0, min: 0 },
    },
    organizationProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON serialization omitting sensitive fields
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorRole: {
      type: String,
      enum: ['individual', 'organization', 'admin'],
      default: 'individual',
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [3000, 'Post cannot exceed 3000 characters'],
    },
    mediaUrl: {
      type: String,
      default: '',
      trim: true,
    },
    causeCategory: {
      type: String,
      default: 'General',
      index: true,
    },
    initiative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Initiative',
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);

const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false }, // For email verification
    verificationCode: String, // For code-based verification
    verificationCodeExpires: Date, // Expiry for the verification code
    avatar_key: { type: String },
    bio: { type: String },
    role: {
      type: String,
      enum: ['student', 'moderator', 'admin'],
      default: 'student',
    },
    interests: [{ type: String }],
    socialLinks: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    bookmarked_posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)

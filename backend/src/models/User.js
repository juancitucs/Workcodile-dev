const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar_key: { type: String },
    bio: { type: String },
    role: {
      type: String,
      enum: ['student', 'moderator', 'admin'],
      default: 'student',
    },
    cycle: { type: Number },
    interests: [{ type: String }],
    bookmarked_posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)

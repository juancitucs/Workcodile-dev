const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    comments: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true },
    votes: { type: Boolean, default: false },
  },
  privacy: {
    profileVisibility: { type: String, enum: ['public', 'students', 'private'], default: 'public' },
    showEmail: { type: Boolean, default: false },
    showStats: { type: Boolean, default: true },
    allowMessages: { type: Boolean, default: true },
  },
  display: {
    postsPerPage: { type: Number, default: 10 },
  },
  sound: {
    enabled: { type: Boolean, default: true },
    volume: { type: Number, default: 50 },
  },
});

module.exports = mongoose.model('Settings', SettingsSchema);

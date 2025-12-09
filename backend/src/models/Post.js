const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReplySchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  score: { type: Number, default: 0 },
  upvoted_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downvoted_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

const CommentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  score: { type: Number, default: 0 },
  upvoted_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downvoted_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  replies: [ReplySchema],
});

const AttachmentSchema = new Schema({
  name: { type: String, required: true },
  size: { type: Number, required: true },
  type: { type: String, required: true },
  object_key: { type: String, required: true },
}, { _id: false });

const PostSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course_id: { type: String, required: true, index: true },
  hashtags: [{ type: String }],
  attachments: [AttachmentSchema],
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  viewed_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  // Votes
  upvoted_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downvoted_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  upvote_count: { type: Number, default: 0 },
  downvote_count: { type: Number, default: 0 },
  // Comments
  comments: [CommentSchema],
}, {
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Add a text index for searching
PostSchema.index({ title: 'text', content: 'text', hashtags: 'text' });

module.exports = mongoose.model('Post', PostSchema);

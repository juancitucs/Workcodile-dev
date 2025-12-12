const mongoose = require('mongoose');
const Post = require('../models/Post');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

const migrateData = async () => {
  await connectDB();
  console.log('Starting data migration...');

  try {
    // 1. Rename author_id to author on the root of post documents
    const postUpdateResult = await Post.updateMany(
      { author_id: { $exists: true } },
      { $rename: { 'author_id': 'author' } }
    );
    console.log(`- Renamed 'author_id' to 'author' in ${postUpdateResult.nModified} post documents.`);

    // 2. Iterate through all posts to update nested comments and replies
    const posts = await Post.find({});
    let commentsUpdated = 0;
    let repliesUpdated = 0;

    for (const post of posts) {
      let postModified = false;

      // Update comments
      if (post.comments && post.comments.length > 0) {
        post.comments.forEach(comment => {
          if (comment.author_id) {
            comment.author = comment.author_id;
            comment.author_id = undefined; // This will be removed by Mongoose
            commentsUpdated++;
            postModified = true;
          }

          // Update replies within comments
          if (comment.replies && comment.replies.length > 0) {
            comment.replies.forEach(reply => {
              if (reply.author_id) {
                reply.author = reply.author_id;
                reply.author_id = undefined;
                repliesUpdated++;
                postModified = true;
              }
            });
          }
        });
      }
      
      if (postModified) {
        await post.save();
      }
    }

    console.log(`- Migrated ${commentsUpdated} nested comments.`);
    console.log(`- Migrated ${repliesUpdated} nested replies.`);

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('An error occurred during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB Disconnected.');
  }
};

migrateData();

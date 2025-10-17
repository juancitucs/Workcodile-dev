const mongoose = require('mongoose');

const getAllPosts = async (req, res) => {
  try {
    const posts = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            let: { author_id: '$author_id' },
            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$author_id'] } } }],
            as: 'authorInfo',
          },
        },
        {
          $unwind: {
            path: '$authorInfo',
            preserveNullAndEmptyArrays: true, // Keep posts even if author is not found
          },
        },
        {
          $project: {
            title: 1,
            content: 1,
            course_id: 1,
            createdAt: 1,
            updatedAt: 1,
            hashtags: 1,
            attachments: 1,
            views: 1,
            upvote_count: 1,
            downvote_count: 1,
            average_rating: 1,
            'author.name': '$authorInfo.name',
            'author.avatar_key': '$authorInfo.avatar_key',
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

module.exports = {
  getAllPosts,
};

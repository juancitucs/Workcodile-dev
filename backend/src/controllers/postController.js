const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const { getFileUrl } = require('../services/storage/storage.service');

const postAggregationPipeline = [
  // 1. Unwind the comments array
  {
    $unwind: {
      path: '$comments',
      preserveNullAndEmptyArrays: true,
    },
  },
  // 2. Group back by post
  {
    $group: {
      _id: '$_id',
      title: { $first: '$title' },
      content: { $first: '$content' },
      author_id: { $first: '$author_id' },
      createdAt: { $first: '$createdAt' },
      updatedAt: { $first: '$updatedAt' },
      course_id: { $first: '$course_id' },
      hashtags: { $first: '$hashtags' },
      attachments: { $first: '$attachments' },
      views: { $first: '$views' },
      upvote_count: { $first: '$upvote_count' },
      downvote_count: { $first: '$downvote_count' },
      average_rating: { $first: '$average_rating' },
      comments: { $push: '$comments' },
    },
  },
  // 3. Lookup author for the post itself
  {
    $lookup: {
      from: 'users',
      localField: 'author_id',
      foreignField: '_id',
      as: 'author',
    },
  },
  // 4. Unwind the post author
  {
    $unwind: {
      path: '$author',
      preserveNullAndEmptyArrays: true,
    },
  },
  // 5. Final projection
  {
    $project: {
      title: 1,
      content: 1,
      course_id: 1,
      createdAt: 1,
      updatedAt: 1,
      hashtags: 1,
      attachments: {
        $map: {
          input: '$attachments',
          as: 'att',
          in: {
            name: '$$att.name',
            size: '$$att.size',
            type: '$$att.type',
            object_key: '$$att.object_key',
          }
        }
      },
      views: 1,
      upvote_count: 1,
      downvote_count: 1,
      average_rating: 1,
      author: {
        _id: '$author._id',
        name: '$author.name',
        avatar_key: '$author.avatar_key',
      },
      comments: {
        $filter: { // Remove empty comment objects from posts with no comments
          input: '$comments',
          as: 'comment',
          cond: { $ifNull: ['$$comment._id', false] }
        }
      }
    },
  },
]

const getAllPosts = async (req, res) => {
  try {
    const posts = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        ...postAggregationPipeline,
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    const populateCommentAuthors = async (comments) => {
      for (const comment of comments) {
        const author = await mongoose.connection.db.collection('users').findOne({ _id: comment.author_id });
        comment.author = {
            _id: author._id,
            name: author.name,
            avatar_key: author.avatar_key,
        };
        if (comment.replies && comment.replies.length > 0) {
            await populateCommentAuthors(comment.replies);
        }
      }
    };

    for (const post of posts) {
        if (post.comments && post.comments.length > 0) {
            await populateCommentAuthors(post.comments);
        }
    }

    res.status(200).json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    res.status(500).json({ message: 'Error fetching posts' })
  }
}

const votePost = async (req, res) => {
  try {
    const { id } = req.params
    const { vote } = req.body // 'up' or 'down'
    const userId = new ObjectId(req.user.id)
    const user = await mongoose.connection.db.collection('users').findOne({ _id: userId });

    const post = await mongoose.connection.db
      .collection('posts')
      .findOne({ _id: new ObjectId(id) })

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    let update = {}
    let alreadyUpvoted = false
    let alreadyDownvoted = false

    if (post.upvoted_by) {
      alreadyUpvoted = post.upvoted_by.some((id) => id.equals(userId))
    }
    if (post.downvoted_by) {
      alreadyDownvoted = post.downvoted_by.some((id) => id.equals(userId))
    }

    if (vote === 'up') {
      if (alreadyUpvoted) {
        // Remove upvote
        update = {
          $inc: { upvote_count: -1 },
          $pull: { upvoted_by: userId },
        };
        await mongoose.connection.db.collection('posts').updateOne({ _id: new ObjectId(id) }, update);
      } else {
        // Add upvote
        update = {
          $inc: { upvote_count: 1 },
          $push: { upvoted_by: userId },
        };
        if (alreadyDownvoted) {
          // Remove downvote if it exists
          await mongoose.connection.db.collection('posts').updateOne({ _id: new ObjectId(id) }, { $inc: { downvote_count: -1 }, $pull: { downvoted_by: userId } });
        }
        await mongoose.connection.db.collection('posts').updateOne({ _id: new ObjectId(id) }, update);
      }
    } else if (vote === 'down') {
      if (alreadyDownvoted) {
        // Remove downvote
        update = {
          $inc: { downvote_count: -1 },
          $pull: { downvoted_by: userId },
        };
        await mongoose.connection.db.collection('posts').updateOne({ _id: new ObjectId(id) }, update);
      } else {
        // Add downvote
        update = {
          $inc: { downvote_count: 1 },
          $push: { downvoted_by: userId },
        };
        if (alreadyUpvoted) {
          // Remove upvote if it exists
          await mongoose.connection.db.collection('posts').updateOne({ _id: new ObjectId(id) }, { $inc: { upvote_count: -1 }, $pull: { upvoted_by: userId } });
        }
        await mongoose.connection.db.collection('posts').updateOne({ _id: new ObjectId(id) }, update);
      }
    } else {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    if (post.author_id.toString() !== userId.toString()) {
      const notification = new Notification({
        user: post.author_id,
        text: `${user.name} ha votado en tu publicación: "${post.title}"`,
        link: `/post/${id}`
      });
      await notification.save();
    }

    const updatedPost = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        ...postAggregationPipeline,
      ])
      .toArray()
    res.status(200).json(updatedPost[0])
  } catch (error) {
    console.error('Error voting on post:', error)
    res.status(500).json({ message: 'Error voting on post' })
  }
}

const addCommentToPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentId } = req.body;
    const userId = new ObjectId(req.user.id);
    const user = await mongoose.connection.db.collection('users').findOne({ _id: userId });

    const comment = {
      _id: new ObjectId(),
      author_id: userId,
      content,
      createdAt: new Date(),
      score: 0,
      replies: [],
      parentId: parentId ? new ObjectId(parentId) : null,
    };

    const post = await mongoose.connection.db.collection('posts').findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (parentId) {
      const findAndPushReply = (comments, parentId, reply) => {
        for (const comment of comments) {
          if (comment._id.equals(parentId)) {
            if (!comment.replies) {
              comment.replies = [];
            }
            comment.replies.push(reply);
            return true;
          }
          if (comment.replies && comment.replies.length > 0) {
            if (findAndPushReply(comment.replies, parentId, reply)) {
              return true;
            }
          }
        }
        return false;
      };

      if (findAndPushReply(post.comments, new ObjectId(parentId), comment)) {
        await mongoose.connection.db.collection('posts').updateOne({ _id: new ObjectId(id) }, { $set: { comments: post.comments } });
      } else {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    } else {
      await mongoose.connection.db.collection('posts').updateOne({ _id: new ObjectId(id) }, { $push: { comments: comment } });
    }

    if (post.author_id.toString() !== userId.toString()) {
      const notification = new Notification({
        user: post.author_id,
        text: `${user.name} ha comentado en tu publicación: "${post.title}"`,
        link: `/post/${id}`
      });
      await notification.save();
    }

    const updatedPostForAgg = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        ...postAggregationPipeline,
      ])
      .toArray();

    const updatedPost = updatedPostForAgg[0];

    const populateCommentAuthors = async (comments) => {
      for (const comment of comments) {
        const author = await mongoose.connection.db.collection('users').findOne({ _id: comment.author_id });
        comment.author = {
            _id: author._id,
            name: author.name,
            avatar_key: author.avatar_key,
        };
        if (comment.replies && comment.replies.length > 0) {
            await populateCommentAuthors(comment.replies);
        }
      }
    };

    if (updatedPost.comments && updatedPost.comments.length > 0) {
        await populateCommentAuthors(updatedPost.comments);
    }

    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
};

const createPost = async (req, res) => {
  console.log('Create post called');
  console.log('req.body:', req.body);
  try {
    const { title, content, course, hashtags, attachments } = req.body
    const userId = new ObjectId(req.user.id)

    const newPost = {
      title,
      content,
      course_id: course,
      hashtags,
      attachments,
      author_id: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      upvote_count: 0,
      downvote_count: 0,
      upvoted_by: [],
      downvoted_by: [],
      comments: [],
      views: 0,
      average_rating: 0,
      total_ratings: 0,
    }

    const result = await mongoose.connection.db
      .collection('posts')
      .insertOne(newPost)
    
    const createdPost = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        { $match: { _id: result.insertedId } },
        ...postAggregationPipeline,
      ])
      .toArray()

    res.status(201).json(createdPost[0])
  } catch (error) {
    console.error('Error creating post:', error)
    res.status(500).json({ message: 'Error creating post' })
  }
}

const voteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params
    const { vote } = req.body
    const userId = new ObjectId(req.user.id)

    const post = await mongoose.connection.db
      .collection('posts')
      .findOne({ _id: new ObjectId(postId) })

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const comment = post.comments.find((c) => c._id.equals(new ObjectId(commentId)))

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    const upvoted = comment.upvoted_by && comment.upvoted_by.some((id) => id.equals(userId))
    const downvoted = comment.downvoted_by && comment.downvoted_by.some((id) => id.equals(userId))

    let update = {}
    const arrayFilters = [{ 'comment._id': new ObjectId(commentId) }]

    if (vote === 'up') {
      if (upvoted) {
        update = {
          $inc: { 'comments.$[comment].score': -1 },
          $pull: { 'comments.$[comment].upvoted_by': userId },
        }
      } else {
        update = {
          $inc: { 'comments.$[comment].score': 1 },
          $push: { 'comments.$[comment].upvoted_by': userId },
        }
        if (downvoted) {
          update.$inc['comments.$[comment].score'] += 1
          update.$pull = { 'comments.$[comment].downvoted_by': userId }
        }
      }
    } else if (vote === 'down') {
      if (downvoted) {
        update = {
          $inc: { 'comments.$[comment].score': 1 },
          $pull: { 'comments.$[comment].downvoted_by': userId },
        }
      } else {
        update = {
          $inc: { 'comments.$[comment].score': -1 },
          $push: { 'comments.$[comment].downvoted_by': userId },
        }
        if (upvoted) {
          update.$inc['comments.$[comment].score'] -= 1
          update.$pull = { 'comments.$[comment].upvoted_by': userId }
        }
      }
    } else {
      return res.status(400).json({ message: 'Invalid vote type' })
    }

    await mongoose.connection.db
      .collection('posts')
      .updateOne({ _id: new ObjectId(postId) }, update, { arrayFilters })

    const updatedPostAgg = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        { $match: { _id: new ObjectId(postId) } },
        ...postAggregationPipeline,
      ])
      .toArray()

    const updatedPost = updatedPostAgg[0]

    const populateCommentAuthors = async (comments) => {
      for (const comment of comments) {
        const author = await mongoose.connection.db
          .collection('users')
          .findOne({ _id: comment.author_id })
        comment.author = {
          _id: author._id,
          name: author.name,
          avatar_key: author.avatar_key,
        }
        if (comment.replies && comment.replies.length > 0) {
          await populateCommentAuthors(comment.replies)
        }
      }
    }

    if (updatedPost.comments && updatedPost.comments.length > 0) {
      await populateCommentAuthors(updatedPost.comments)
    }

    res.status(200).json(updatedPost)
  } catch (error) {
    console.error('Error voting on comment:', error)
    res.status(500).json({ message: 'Error voting on comment' })
  }
}

const ratePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = new ObjectId(req.user.id);

    const post = await mongoose.connection.db.collection('posts').findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userRating = post.ratings && post.ratings.find((r) => r.user_id.equals(userId));

    let newTotalRatings = post.total_ratings || 0;
    let currentTotal = (post.average_rating || 0) * newTotalRatings;

    if (userRating) {
      currentTotal -= userRating.value;
      userRating.value = rating;
    } else {
      if (!post.ratings) {
        post.ratings = [];
      }
      post.ratings.push({ user_id: userId, value: rating });
      newTotalRatings++;
    }

    const newAverageRating = (currentTotal + rating) / newTotalRatings;

    await mongoose.connection.db.collection('posts').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ratings: post.ratings,
          total_ratings: newTotalRatings,
          average_rating: newAverageRating,
        },
      }
    );

    const updatedPost = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        ...postAggregationPipeline,
      ])
      .toArray();

    res.status(200).json(updatedPost[0]);
  } catch (error) {
    console.error('Error rating post:', error);
    res.status(500).json({ message: 'Error rating post' });
  }
};

const bookmarkPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new ObjectId(req.user.id);

    const user = await mongoose.connection.db.collection('users').findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const postObjectId = new ObjectId(id);
    const isBookmarked = user.bookmarked_posts && user.bookmarked_posts.some(postId => postId.equals(postObjectId));

    let update;
    if (isBookmarked) {
      update = { $pull: { bookmarked_posts: postObjectId } };
    } else {
      update = { $push: { bookmarked_posts: postObjectId } };
    }

    await mongoose.connection.db.collection('users').updateOne({ _id: userId }, update);

    res.status(200).json({ bookmarked: !isBookmarked });

  } catch (error) {
    console.error('Error bookmarking post:', error);
    res.status(500).json({ message: 'Error bookmarking post' });
  }
};



const reportPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = new ObjectId(req.user.id);

    const newReport = new Report({
      post: id,
      user: userId,
      reason: reason || 'No reason provided',
    });

    await newReport.save();

    res.status(200).json({ message: 'Post reported successfully' });
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({ message: 'Error reporting post' });
  }
};

const incrementView = async (req, res) => {
  try {
    const { id } = req.params;

    await mongoose.connection.db.collection('posts').updateOne({ _id: new ObjectId(id) }, { $inc: { views: 1 } });

    res.status(200).json({ message: 'View count incremented' });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({ message: 'Error incrementing view count' });
  }
};

const downloadAttachment = async (req, res) => {
  try {
    const { object_key } = req.params;
    const url = await getFileUrl(object_key);
    res.redirect(url);
  } catch (error) {
    console.error('Error getting attachment URL:', error);
    res.status(500).json({ message: 'Error getting attachment URL' });
  }
};

module.exports = {
  getAllPosts,
  votePost,
  createPost,
  addCommentToPost,
  voteComment,
  ratePost,
  bookmarkPost,
  reportPost,
  incrementView,
  downloadAttachment,
}

const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const { getFileUrl } = require('../services/storage/storage.service');
const { addXP } = require('../services/xpService');

const postAggregationPipeline = [
  // 0. Ensure author field exists, falling back to author_id for old documents
  {
    $addFields: {
      effective_author_id: { $ifNull: ["$author", "$author_id"] }
    }
  },
  // 1. Lookup author for the post
  {
    $lookup: {
      from: 'users',
      localField: 'effective_author_id',
      foreignField: '_id',
      as: 'author',
    },
  },
  // 2. Unwind author for the post
  {
    $unwind: {
      path: '$author',
      preserveNullAndEmptyArrays: true, // Keep posts even if author is not found
    },
  },
  // Start comments processing
  {
    $unwind: {
      path: '$comments',
      preserveNullAndEmptyArrays: true // Keep posts even if they have no comments
    }
  },
  // Add a consistent author ID field for comments to handle both old and new comment structures
  {
    $addFields: {
      'comments.authorId': {
        $cond: {
          if: { $eq: [{ $type: '$comments.author' }, 'object'] },
          then: '$comments.author._id',
          else: '$comments.author'
        }
      }
    }
  },
  // Lookup author for comments
  {
    $lookup: {
      from: 'users',
      localField: 'comments.authorId',
      foreignField: '_id',
      as: 'comments.authorInfo'
    }
  },
  {
    $unwind: {
      path: '$comments.authorInfo',
      preserveNullAndEmptyArrays: true
    }
  },
  // Add avatar URLs for comment authors and attachment URLs for comments
  {
    $addFields: {
      'comments.author': {
        $cond: {
          if: '$comments.authorInfo',
          then: {
            _id: '$comments.authorInfo._id',
            name: '$comments.authorInfo.name',
            avatar_key: '$comments.authorInfo.avatar_key',
            level: '$comments.authorInfo.level',
          },
          else: { // Default anonymous user info
            _id: '$comments.author', // Keep original author ID if available
            name: 'Usuario Anónimo',
            avatar_key: null,
            avatar: null,
            level: 1,
          }
        }
      },
      'comments.attachments': '$comments.attachments'
    }
  },
  // Group back comments into an array, reconstructing replies
  {
    $group: {
      _id: '$_id',
      title: { $first: '$title' },
      content: { $first: '$content' },
      course_id: { $first: '$course_id' },
      createdAt: { $first: '$createdAt' },
      updatedAt: { $first: '$updatedAt' },
      hashtags: { $first: '$hashtags' },
      attachments: { $first: '$attachments' },
      views: { $first: '$views' },
      upvote_count: { $first: { $size: { $ifNull: ["$upvoted_by", []] } } },
      downvote_count: { $first: { $size: { $ifNull: ["$downvoted_by", []] } } },
      upvoted_by: { $first: '$upvoted_by' },
      downvoted_by: { $first: '$downvoted_by' },
      author: { $first: '$author' },
      comments: {
        $push: {
          _id: '$comments._id',
          author: '$comments.author',
          content: '$comments.content',
          attachments: '$comments.attachments',
          createdAt: '$comments.createdAt',
          score: '$comments.score',
          replies: '$comments.replies', // Keep original replies structure
          parentId: '$comments.parentId',
          upvoted_by: '$comments.upvoted_by',
          downvoted_by: '$comments.downvoted_by'
        }
      }
    }
  },
  // Final projection (similar to original, but with populated comments)
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
      upvoted_by: 1,
      downvoted_by: 1,
      author: {
        _id: '$author._id',
        name: '$author.name',
        avatar_key: '$author.avatar_key',
        level: '$author.level',
      },
      comments: {
        $filter: {
          input: '$comments',
          as: 'comment',
          // Filter out null comments that result from preserveNullAndEmptyArrays: true
          // on posts with no comments.
          // This also allows to filter out replies in favor of recursive population later on
          cond: { $and: [{ $ne: ['$$comment', {}] }, { $eq: ['$$comment.parentId', null] }] }
        }
      }
    }
  }
];



// Helper function to add user_vote status
const addUserVoteStatus = (item, currentUserId) => {
  if (!currentUserId) {
    item.user_vote = null;
    return;
  }
  const userIdObjectId = new ObjectId(currentUserId);

  if (item.upvoted_by && item.upvoted_by.some(id => id.equals(userIdObjectId))) {
    item.user_vote = 'up';
  } else if (item.downvoted_by && item.downvoted_by.some(id => id.equals(userIdObjectId))) {
    item.user_vote = 'down';
  } else {
    item.user_vote = null;
  }

  // Recursively apply to comments and replies
  if (item.comments) {
    item.comments.forEach(comment => {
      addUserVoteStatus(comment, currentUserId);
      if (comment.replies) {
        comment.replies.forEach(reply => addUserVoteStatus(reply, currentUserId));
      }
    });
  }
};

const addUrlsToItems = (items) => {
  if (!items) return;
  for (const item of items) {
    if (item.author && item.author.avatar_key) {
      item.author.avatar = getFileUrl(item.author.avatar_key);
    }
    if (item.attachments) {
      item.attachments.forEach(att => {
        if (att.object_key) att.url = getFileUrl(att.object_key);
      });
    }
    if (item.comments) {
      addUrlsToItems(item.comments);
    }
    if (item.replies) {
      addUrlsToItems(item.replies);
    }
  }
};


const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = await mongoose.connection.db.collection('posts').countDocuments();

    const posts = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        ...postAggregationPipeline,
      ])
      .toArray()


    addUrlsToItems(posts);

    for (const post of posts) {
      addUserVoteStatus(post, req.user ? req.user.id : null);
    }

    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      posts,
      page,
      totalPages,
      hasNextPage: page < totalPages,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' })
  }
}

const votePost = async (req, res) => {
  try {
    const { id } = req.params
    const { vote } = req.body // 'up' or 'down'
    const userId = new ObjectId(req.user.id)
    const user = await mongoose.connection.db.collection('users').findOne({ _id: userId });

    // Award 1 XP for participation (voting)
    await addXP(userId.toString(), 1, { totalLikesGiven: 1 });

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
        // Award XP to post author for receiving an upvote
        if (post.author.toString() !== userId.toString()) {
          await addXP(post.author.toString(), 5, { totalLikesReceived: 1 });
        }
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

    if (post.author.toString() !== userId.toString()) {
      const notification = new Notification({
        user: post.author,
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
    
    addUrlsToItems(updatedPost);
    addUserVoteStatus(updatedPost[0], req.user ? req.user.id : null);
    res.status(200).json(updatedPost[0])
  } catch (error) {
    console.error('Error voting on post:', error)
    res.status(500).json({ message: 'Error voting on post' })
  }
}

const addCommentToPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentId, attachments } = req.body; // ADD attachments
    const userId = new ObjectId(req.user.id);
    const user = await mongoose.connection.db.collection('users').findOne({ _id: userId });

    const comment = {
      _id: new ObjectId(),
      author: { _id: userId },
      content,
      attachments: attachments || [], // ADD attachments
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

    if (post.author.toString() !== userId.toString()) {
      const notification = new Notification({
        user: post.author,
        text: `${user.name} ha comentado en tu publicación: "${post.title}"`,
        link: `/post/${id}#comment-${comment._id}`
      });
      await notification.save();
    }

    // Add XP for creating a comment
    await addXP(userId.toString(), 3, { totalComments: 1 });

    const updatedPostForAgg = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        ...postAggregationPipeline,
      ])
      .toArray();

    const updatedPost = updatedPostForAgg[0];

    addUrlsToItems([updatedPost]);

    addUserVoteStatus(updatedPost, req.user ? req.user.id : null);

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
      author: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      upvote_count: 0,
      downvote_count: 0,
      upvoted_by: [],
      downvoted_by: [],
      comments: [],
      views: 0,
    }

    const result = await mongoose.connection.db
      .collection('posts')
      .insertOne(newPost)

    // Add XP for creating a post
    await addXP(userId.toString(), 10, { totalPosts: 1 });

    const createdPost = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        { $match: { _id: result.insertedId } },
        ...postAggregationPipeline,
      ])
      .toArray()
    addUrlsToItems(createdPost);
    addUserVoteStatus(createdPost[0], req.user ? req.user.id : null);
    res.status(201).json(createdPost[0])
  } catch (error) {
    console.error('Error creating post:', error)
    res.status(500).json({ message: 'Error creating post' })
  }
}

const findCommentRecursive = (comments, targetCommentId) => {
  for (const comment of comments) {
    if (comment._id.equals(targetCommentId)) {
      return comment;
    }
    if (comment.replies && comment.replies.length > 0) {
      const found = findCommentRecursive(comment.replies, targetCommentId);
      if (found) return found;
    }
  }
  return null;
};

const voteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params
    const { vote } = req.body
    const userId = new ObjectId(req.user.id)

    // Award 1 XP for participation (voting on a comment)
    await addXP(userId.toString(), 1, { totalLikesGiven: 1 });

    const post = await mongoose.connection.db
      .collection('posts')
      .findOne({ _id: new ObjectId(postId) })

    if (!post) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const commentToVote = findCommentRecursive(post.comments, new ObjectId(commentId));

    if (!commentToVote) {
      return res.status(404).json({ message: 'Comment not found' })
    }

    // Ensure upvoted_by and downvoted_by arrays exist
    if (!commentToVote.upvoted_by) {
      commentToVote.upvoted_by = [];
    }
    if (!commentToVote.downvoted_by) {
      commentToVote.downvoted_by = [];
    }

    // Determine current vote status for this user on this comment
    const upvoted = commentToVote.upvoted_by.some((id) => id.equals(userId))
    const downvoted = commentToVote.downvoted_by.some((id) => id.equals(userId))

    if (vote === 'up') {
      if (upvoted) {
        // User is un-upvoting
        commentToVote.score--;
        commentToVote.upvoted_by = commentToVote.upvoted_by.filter(id => !id.equals(userId));
      } else {
        // User is upvoting
        commentToVote.score++;
        commentToVote.upvoted_by.push(userId);
        // Award XP to comment author for receiving an upvote
        if (commentToVote.author.toString() !== userId.toString()) {
          await addXP(commentToVote.author.toString(), 2, { totalLikesReceived: 1 });
        }
        if (downvoted) {
          // User was downvoting, remove downvote
          commentToVote.score++; // Compensate for the previous downvote
          commentToVote.downvoted_by = commentToVote.downvoted_by.filter(id => !id.equals(userId));
        }
      }
    } else if (vote === 'down') {
      if (downvoted) {
        // User is un-downvoting
        commentToVote.score++;
        commentToVote.downvoted_by = commentToVote.downvoted_by.filter(id => !id.equals(userId));
      } else {
        // User is downvoting
        commentToVote.score--;
        commentToVote.downvoted_by.push(userId);
        if (upvoted) {
          // User was upvoting, remove upvote
          commentToVote.score--; // Compensate for the previous upvote
          commentToVote.upvoted_by = commentToVote.upvoted_by.filter(id => !id.equals(userId));
        }
      }
    } else {
      return res.status(400).json({ message: 'Invalid vote type' })
    }

    // Update the entire comments array in the database
    await mongoose.connection.db.collection('posts').updateOne(
      { _id: new ObjectId(postId) },
      { $set: { comments: post.comments } }
    );

    const updatedPostAgg = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        { $match: { _id: new ObjectId(postId) } },
        ...postAggregationPipeline,
      ])
      .toArray()

    const updatedPost = updatedPostAgg[0]

    addUrlsToItems([updatedPost]);

    addUserVoteStatus(updatedPost, req.user ? req.user.id : null);

    res.status(200).json(updatedPost)

  } catch (error) {
    console.error('Error voting on comment:', error)
    res.status(500).json({ message: 'Error voting on comment' })
  }
}

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



const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const commentLimit = parseInt(req.query.commentLimit, 10) || 5; // Default 5 comments initially
    const commentOffset = parseInt(req.query.commentOffset, 10) || 0;

    const postAgg = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        ...postAggregationPipeline,
      ])
      .toArray();

    if (!postAgg.length) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = postAgg[0];


    addUrlsToItems([post]);
    
    // Store total comments count before slicing
    const totalComments = post.comments ? post.comments.length : 0;

    // Paginate root-level comments only (replies stay nested)
    if (post.comments && post.comments.length > 0) {
      // Sort comments by score (most popular first)
      post.comments.sort((a, b) => (b.score || 0) - (a.score || 0));

      // Apply pagination to root-level comments
      const paginatedComments = post.comments.slice(commentOffset, commentOffset + commentLimit);
      post.comments = paginatedComments;
    }

    addUserVoteStatus(post, req.user ? req.user.id : null);

    // Add pagination metadata
    post.totalComments = totalComments;
    post.hasMoreComments = commentOffset + commentLimit < totalComments;
    post.commentOffset = commentOffset;
    post.commentLimit = commentLimit;

    res.status(200).json(post);

  } catch (error) {
    console.error('Error fetching post by ID:', error);
    res.status(500).json({ message: 'Error fetching post by ID' });
  }
};

const getPostByCommentId = async (req, res) => {
  try {
    const { commentId } = req.params;
    const id = new ObjectId(commentId);

    const post = await mongoose.connection.db.collection('posts').findOne({
      $or: [
        { "comments._id": id },
        { "comments.replies._id": id }
      ]
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found for this comment' });
    }

    // Fake req and res objects to call getPostById
    const mockReq = { params: { id: post._id.toString() }, user: req.user };
    const mockRes = {
      status: (statusCode) => ({
        json: (data) => res.status(statusCode).json(data),
      }),
    };

    await getPostById(mockReq, mockRes);

  } catch (error) {
    console.error('Error fetching post by comment ID:', error);
    res.status(500).json({ message: 'Error fetching post by comment ID' });
  }
};

const getCommentReplies = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user ? req.user.id : null;

    const postAgg = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        { $match: { _id: new ObjectId(postId) } },
        ...postAggregationPipeline,
      ])
      .toArray();

    if (!postAgg.length) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = postAgg[0];
    addUrlsToItems([post]);

    const parentComment = findCommentRecursive(post.comments, new ObjectId(commentId));

    if (!parentComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const replies = parentComment.replies || [];

    replies.forEach(reply => {
      addUserVoteStatus(reply, userId);
    });

    res.status(200).json(replies);
  } catch (error) {
    console.error('Error fetching replies:', error);
    res.status(500).json({ message: 'Error fetching replies' });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = new ObjectId(req.user.id);

    const post = await mongoose.connection.db.collection('posts').findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'User not authorized to update this post' });
    }

    const updatedPost = await mongoose.connection.db.collection('posts').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { title, content, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    const postAgg = await mongoose.connection.db.collection('posts').aggregate([
      { $match: { _id: new ObjectId(id) } },
      ...postAggregationPipeline
    ]).toArray();

    if (!postAgg.length) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const finalPost = postAgg[0];
    addUrlsToItems([finalPost]);
    addUserVoteStatus(finalPost, req.user ? req.user.id : null);

    res.status(200).json(finalPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new ObjectId(req.user.id);

    const post = await mongoose.connection.db.collection('posts').findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this post' });
    }

    await mongoose.connection.db.collection('posts').findOneAndDelete({ _id: new ObjectId(id) });

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
};


module.exports = {
  getAllPosts,
  getPostById,
  getPostByCommentId,
  getCommentReplies,
  votePost,
  createPost,
  addCommentToPost,
  voteComment,
  bookmarkPost,
  reportPost,
  incrementView,
  updatePost,
  deletePost,
}

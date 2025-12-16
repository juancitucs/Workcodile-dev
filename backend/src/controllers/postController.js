const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const { getFileUrl } = require('../services/storage/storage.service');

const postAggregationPipeline = [
  // 0. Ensure author field exists, falling back to author_id for old documents
  {
    $addFields: {
      effective_author_id: { $ifNull: ["$author", "$author_id"] }
    }
  },
  // 1. Lookup author
  {
    $lookup: {
      from: 'users',
      localField: 'effective_author_id',
      foreignField: '_id',
      as: 'author',
    },
  },
  // 2. Unwind author
  {
    $unwind: {
      path: '$author',
      preserveNullAndEmptyArrays: true, // Keep posts even if author is not found
    },
  },
  // 3. Final projection
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
      upvote_count: { $size: { $ifNull: ["$upvoted_by", []] } }, // Correctly count upvotes
      downvote_count: { $size: { $ifNull: ["$downvoted_by", []] } }, // Correctly count downvotes
      upvoted_by: 1,
      downvoted_by: 1,
      author: {
        _id: '$author._id',
        name: '$author.name',
        avatar_key: '$author.avatar_key',
      },
      comments: 1,
    },
  },
];

// Shared helper function for populating comment authors and URLs
const populateCommentAuthors = async (comments) => {
  for (const comment of comments) {
    let authorIdToLookup = null;
    if (comment.author && typeof comment.author.equals === 'function') { // Check if it's already an ObjectId
      authorIdToLookup = comment.author;
    } else if (comment.author) { // If it's a string, convert to ObjectId
      authorIdToLookup = new ObjectId(comment.author);
    } else if (comment.author_id) { // Fallback to author_id
      authorIdToLookup = new ObjectId(comment.author_id);
    }

    if (authorIdToLookup) {
      const author = await mongoose.connection.db.collection('users').findOne({ _id: authorIdToLookup });
      comment.author = {
        _id: author._id,
        name: author.name,
        avatar_key: author.avatar_key,
        avatar: author.avatar_key ? getFileUrl(author.avatar_key) : undefined,
      };
    } else {
      comment.author = {
        _id: null,
        name: 'Usuario Anónimo',
        avatar_key: null,
        avatar: undefined,
      };
    }
    
    // Add attachment URLs for comments
    if (comment.attachments) {
        comment.attachments.forEach(att => {
            if (att.object_key) att.url = getFileUrl(att.object_key);
        });
    }
    if (comment.replies && comment.replies.length > 0) {
      await populateCommentAuthors(comment.replies);
    }
  }
};

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

    for (const post of posts) {
        // Add author avatar URL
        if (post.author && post.author.avatar_key) {
            post.author.avatar = getFileUrl(post.author.avatar_key);
        }
        // Add attachment URLs
        if (post.attachments) {
            post.attachments.forEach(att => {
                if (att.object_key) att.url = getFileUrl(att.object_key);
            });
        }
        if (post.comments && post.comments.length > 0) {
            await populateCommentAuthors(post.comments);
        }
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
      author: userId,
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

    const updatedPostForAgg = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        ...postAggregationPipeline,
      ])
      .toArray();

    const updatedPost = updatedPostForAgg[0];

        if (updatedPost.comments && updatedPost.comments.length > 0) {

            await populateCommentAuthors(updatedPost.comments);

        }

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
    
    const createdPost = await mongoose.connection.db
      .collection('posts')
            .aggregate([
              { $match: { _id: result.insertedId } },
              ...postAggregationPipeline,
            ])
            .toArray()
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

    

        // Add author avatar URL

        if (post.author && post.author.avatar_key) {

            post.author.avatar = getFileUrl(post.author.avatar_key);

        }

        // Add attachment URLs for the main post

        if (post.attachments) {

            post.attachments.forEach(att => {

                if (att.object_key) att.url = getFileUrl(att.object_key);

            });

        }

    

        if (post.comments && post.comments.length > 0) {

            await populateCommentAuthors(post.comments);

        }

    

        addUserVoteStatus(post, req.user ? req.user.id : null);

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

    const post = await mongoose.connection.db.collection('posts').findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    let parentComment = null;
    const findComment = (comments) => {
      for (const comment of comments) {
        if (comment._id.equals(new ObjectId(commentId))) {
          parentComment = comment;
          return;
        }
        if (comment.replies && comment.replies.length > 0) {
          findComment(comment.replies);
        }
        if (parentComment) return;
      }
    };

    findComment(post.comments);

    if (!parentComment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const replies = parentComment.replies || [];

    await populateCommentAuthors(replies);
    
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
    if (finalPost.author && finalPost.author.avatar_key) {
      finalPost.author.avatar = getFileUrl(finalPost.author.avatar_key);
    }
    if (finalPost.attachments) {
      finalPost.attachments.forEach(att => {
        if (att.object_key) att.url = getFileUrl(att.object_key);
      });
    }
    if (finalPost.comments && finalPost.comments.length > 0) {
      await populateCommentAuthors(finalPost.comments);
    }
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

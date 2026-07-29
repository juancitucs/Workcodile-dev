const { ObjectId } = require('mongodb')
const mongoose = require('mongoose')
const User = require('../models/User')
const Notification = require('../models/Notification')
const Report = require('../models/Report')
const postService = require('../services/post.service')
const xpService = require('../services/xpService')

const getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 10
    const result = await postService.getPaginatedPosts(page, limit)

    postService.addUrlsToItems(result.posts)
    result.posts.forEach(post => {
      postService.sortComments(post.comments)
      postService.addUserVoteStatus(post, req.user ? req.user.id : null)
    })

    res.status(200).json({
      posts: result.posts,
      page,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
    })
  } catch (error) {
    next(error)
  }
}

const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params
    const commentLimit = parseInt(req.query.commentLimit, 10) || 5
    const commentOffset = parseInt(req.query.commentOffset, 10) || 0

    const post = await postService.getAggregatedPost(id)
    if (!post) {return res.status(404).json({ message: 'Post not found' })}

    postService.addUrlsToItems([post])
    const totalComments = post.comments ? post.comments.length : 0

    if (post.comments && post.comments.length > 0) {
      postService.sortComments(post.comments)
      post.comments = post.comments.slice(commentOffset, commentOffset + commentLimit)
    }

    postService.addUserVoteStatus(post, req.user ? req.user.id : null)
    post.totalComments = totalComments
    post.hasMoreComments = commentOffset + commentLimit < totalComments
    post.commentOffset = commentOffset
    post.commentLimit = commentLimit

    res.status(200).json(post)
  } catch (error) {
    next(error)
  }
}

const getPostByCommentId = async (req, res, next) => {
  try {
    const { commentId } = req.params
    const id = new ObjectId(commentId)

    const post = await mongoose.connection.db.collection('posts').findOne({
      $or: [{ 'comments._id': id }, { 'comments.replies._id': id }]
    })

    if (!post) {return res.status(404).json({ message: 'Post not found for this comment' })}

    const aggregatedPost = await postService.getAggregatedPost(post._id.toString())
    if (!aggregatedPost) {return res.status(404).json({ message: 'Post not found' })}

    postService.addUrlsToItems([aggregatedPost])
    postService.addUserVoteStatus(aggregatedPost, req.user ? req.user.id : null)

    res.status(200).json(aggregatedPost)
  } catch (error) {
    next(error)
  }
}

const getCommentReplies = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params
    const userId = req.user ? req.user.id : null

    const post = await mongoose.connection.db.collection('posts').findOne({ _id: new ObjectId(postId) })
    if (!post) {return res.status(404).json({ message: 'Post not found' })}

    const parentComment = postService.findCommentRecursive(post.comments, new ObjectId(commentId))
    if (!parentComment) {return res.status(404).json({ message: 'Comment not found' })}

    const replies = parentComment.replies || []
    await postService.populateAuthors(replies)
    postService.addUrlsToItems(replies)
    postService.sortComments(replies)
    replies.forEach(reply => postService.addUserVoteStatus(reply, userId))

    res.status(200).json(replies)
  } catch (error) {
    next(error)
  }
}

const createPost = async (req, res, next) => {
  try {
    const { title, content, course, hashtags, attachments } = req.body
    const userId = req.user.id

    const insertedId = await postService.createPostDocument({ title, content, course, hashtags, attachments, authorId: userId })
    const createdPost = await postService.getAggregatedPost(insertedId)

    postService.addUrlsToItems(createdPost ? [createdPost] : [])
    if (createdPost) {postService.addUserVoteStatus(createdPost, userId)}

    res.status(201).json(createdPost)
  } catch (error) {
    next(error)
  }
}

const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, content } = req.body
    const userId = new ObjectId(req.user.id)

    const post = await mongoose.connection.db.collection('posts').findOne({ _id: new ObjectId(id) })
    if (!post) {return res.status(404).json({ message: 'Post not found' })}
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'User not authorized to update this post' })
    }

    await mongoose.connection.db.collection('posts').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { title, content, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    const updatedPost = await postService.getAggregatedPost(id)
    postService.addUrlsToItems(updatedPost ? [updatedPost] : [])
    if (updatedPost) {postService.addUserVoteStatus(updatedPost, req.user.id)}

    res.status(200).json(updatedPost)
  } catch (error) {
    next(error)
  }
}

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = new ObjectId(req.user.id)

    const post = await mongoose.connection.db.collection('posts').findOne({ _id: new ObjectId(id) })
    if (!post) {return res.status(404).json({ message: 'Post not found' })}
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this post' })
    }

    await mongoose.connection.db.collection('posts').findOneAndDelete({ _id: new ObjectId(id) })
    res.status(200).json({ message: 'Post deleted successfully' })
  } catch (error) {
    next(error)
  }
}

const votePost = async (req, res, next) => {
  try {
    const { id } = req.params
    const { vote } = req.body
    const userId = req.user.id

    const post = await mongoose.connection.db.collection('posts').findOne({ _id: new ObjectId(id) })
    if (!post) {return res.status(404).json({ message: 'Post not found' })}

    const user = await User.findById(userId)
    await xpService.addXP(userId, 1, { totalLikesGiven: 1 })

    await postService.handleVote(userId, post, vote)

    if (post.author.toString() !== userId) {
      await Notification.create({
        user: post.author,
        text: `${user.name} ha votado en tu publicación: "${post.title}"`,
        link: `/post/${id}`
      })
    }

    const updatedPost = await postService.getAggregatedPost(id)
    postService.addUrlsToItems(updatedPost ? [updatedPost] : [])
    if (updatedPost) {postService.addUserVoteStatus(updatedPost, userId)}

    res.status(200).json(updatedPost)
  } catch (error) {
    next(error)
  }
}

const addCommentToPost = async (req, res, next) => {
  try {
    const { id } = req.params
    const { content, parentId, attachments } = req.body
    const userId = new ObjectId(req.user.id)
    const user = await User.findById(req.user.id)

    const comment = {
      _id: new ObjectId(),
      author: { _id: userId },
      content,
      attachments: attachments || [],
      createdAt: new Date(),
      score: 0,
      replies: [],
      parentId: parentId ? new ObjectId(parentId) : null,
    }

    const post = await mongoose.connection.db.collection('posts').findOne({ _id: new ObjectId(id) })
    if (!post) {return res.status(404).json({ message: 'Post not found' })}

    if (parentId) {
      const found = postService.findCommentRecursive(post.comments, new ObjectId(parentId))
      if (!found) {return res.status(404).json({ message: 'Parent comment not found' })}
      if (!found.replies) {found.replies = []}
      found.replies.push(comment)
      await mongoose.connection.db.collection('posts').updateOne({ _id: new ObjectId(id) }, { $set: { comments: post.comments } })
    } else {
      await mongoose.connection.db.collection('posts').updateOne({ _id: new ObjectId(id) }, { $push: { comments: comment } })
    }

    if (post.author.toString() !== userId.toString()) {
      await Notification.create({
        user: post.author,
        text: `${user.name} ha comentado en tu publicación: "${post.title}"`,
        link: `/post/${id}#comment-${comment._id}`
      })
    }

    await xpService.addXP(userId.toString(), 3, { totalComments: 1 })

    const updatedPost = await postService.getAggregatedPost(id)
    postService.addUrlsToItems(updatedPost ? [updatedPost] : [])
    if (updatedPost) {postService.addUserVoteStatus(updatedPost, req.user.id)}

    res.status(200).json(updatedPost)
  } catch (error) {
    next(error)
  }
}

const voteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params
    const { vote } = req.body
    const userId = new ObjectId(req.user.id)

    await xpService.addXP(userId.toString(), 1, { totalLikesGiven: 1 })

    const post = await mongoose.connection.db.collection('posts').findOne({ _id: new ObjectId(postId) })
    if (!post) {return res.status(404).json({ message: 'Post not found' })}

    const commentToVote = postService.findCommentRecursive(post.comments, new ObjectId(commentId))
    if (!commentToVote) {return res.status(404).json({ message: 'Comment not found' })}

    if (!commentToVote.upvoted_by) {commentToVote.upvoted_by = []}
    if (!commentToVote.downvoted_by) {commentToVote.downvoted_by = []}

    const upvoted = commentToVote.upvoted_by.some(id => id.equals(userId))
    const downvoted = commentToVote.downvoted_by.some(id => id.equals(userId))

    if (vote === 'up') {
      if (upvoted) {
        commentToVote.score--
        commentToVote.upvoted_by = commentToVote.upvoted_by.filter(id => !id.equals(userId))
      } else {
        commentToVote.score++
        commentToVote.upvoted_by.push(userId)
        if (commentToVote.author.toString() !== userId.toString()) {
          await xpService.addXP(commentToVote.author.toString(), 2, { totalLikesReceived: 1 })
        }
        if (downvoted) {
          commentToVote.score++
          commentToVote.downvoted_by = commentToVote.downvoted_by.filter(id => !id.equals(userId))
        }
      }
    } else if (vote === 'down') {
      if (downvoted) {
        commentToVote.score++
        commentToVote.downvoted_by = commentToVote.downvoted_by.filter(id => !id.equals(userId))
      } else {
        commentToVote.score--
        commentToVote.downvoted_by.push(userId)
        if (upvoted) {
          commentToVote.score--
          commentToVote.upvoted_by = commentToVote.upvoted_by.filter(id => !id.equals(userId))
        }
      }
    } else {
      return res.status(400).json({ message: 'Invalid vote type' })
    }

    await mongoose.connection.db.collection('posts').updateOne(
      { _id: new ObjectId(postId) },
      { $set: { comments: post.comments } }
    )

    const updatedPost = await postService.getAggregatedPost(postId)
    postService.addUrlsToItems(updatedPost ? [updatedPost] : [])
    if (updatedPost) {postService.addUserVoteStatus(updatedPost, req.user.id)}

    res.status(200).json(updatedPost)
  } catch (error) {
    next(error)
  }
}

const bookmarkPost = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = new ObjectId(req.user.id)
    const user = await User.findById(userId)
    if (!user) {return res.status(404).json({ message: 'User not found' })}

    const postObjectId = new ObjectId(id)
    const isBookmarked = user.bookmarked_posts && user.bookmarked_posts.some(postId => postId.equals(postObjectId))

    await User.updateOne(
      { _id: userId },
      isBookmarked ? { $pull: { bookmarked_posts: postObjectId } } : { $push: { bookmarked_posts: postObjectId } }
    )

    res.status(200).json({ bookmarked: !isBookmarked })
  } catch (error) {
    next(error)
  }
}

const reportPost = async (req, res, next) => {
  try {
    const { id } = req.params
    const { reason } = req.body

    await Report.create({ post: id, user: req.user.id, reason: reason || 'No reason provided' })
    res.status(200).json({ message: 'Post reported successfully' })
  } catch (error) {
    next(error)
  }
}

const incrementView = async (req, res, next) => {
  try {
    const { id } = req.params
    await mongoose.connection.db.collection('posts').updateOne({ _id: new ObjectId(id) }, { $inc: { views: 1 } })
    res.status(200).json({ message: 'View count incremented' })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAllPosts, getPostById, getPostByCommentId, getCommentReplies,
  createPost, updatePost, deletePost,
  votePost, addCommentToPost, voteComment,
  bookmarkPost, reportPost, incrementView,
}
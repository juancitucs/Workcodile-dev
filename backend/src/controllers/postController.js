const mongoose = require('mongoose')
const { ObjectId } = require('mongodb')

const postAggregationPipeline = [
  // 1. Unwind the comments array
  {
    $unwind: {
      path: '$comments',
      preserveNullAndEmptyArrays: true,
    },
  },
  // 2. Lookup author for each comment
  {
    $lookup: {
      from: 'users',
      localField: 'comments.author_id',
      foreignField: '_id',
      as: 'comments.author',
    },
  },
  // 3. Unwind the comment author (it's an array)
  {
    $unwind: {
      path: '$comments.author',
      preserveNullAndEmptyArrays: true,
    },
  },
  // 4. Group back by post
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
  // 5. Lookup author for the post itself
  {
    $lookup: {
      from: 'users',
      localField: 'author_id',
      foreignField: '_id',
      as: 'author',
    },
  },
  // 6. Unwind the post author
  {
    $unwind: {
      path: '$author',
      preserveNullAndEmptyArrays: true,
    },
  },
  // 7. Final projection
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
            url: { $concat: [ 'http://localhost:9000/workcodile-files/', '$$att.object_key' ] }
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
        }
      } else {
        // Add upvote
        update = {
          $inc: { upvote_count: 1 },
          $push: { upvoted_by: userId },
        }
        if (alreadyDownvoted) {
          // Remove downvote if it exists
          update.$inc.downvote_count = -1
          update.$pull = { downvoted_by: userId }
        }
      }
    } else if (vote === 'down') {
      if (alreadyDownvoted) {
        // Remove downvote
        update = {
          $inc: { downvote_count: -1 },
          $pull: { downvoted_by: userId },
        }
      } else {
        // Add downvote
        update = {
          $inc: { downvote_count: 1 },
          $push: { downvoted_by: userId },
        }
        if (alreadyUpvoted) {
          // Remove upvote if it exists
          update.$inc.upvote_count = -1
          update.$pull = { upvoted_by: userId }
        }
      }
    } else {
      return res.status(400).json({ message: 'Invalid vote type' })
    }

    await mongoose.connection.db
      .collection('posts')
      .updateOne({ _id: new ObjectId(id) }, update)

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
    const { id } = req.params
    const { content, parentId } = req.body
    const userId = new ObjectId(req.user.id)

    const comment = {
      _id: new ObjectId(),
      author_id: userId,
      content,
      createdAt: new Date(),
      score: 0,
      replies: [],
      parentId: parentId ? new ObjectId(parentId) : null,
    }

    let update

    if (parentId) {
      update = { $push: { 'comments.$[elem].replies': comment } }
      const arrayFilters = [{ 'elem._id': new ObjectId(parentId) }]
      await mongoose.connection.db
        .collection('posts')
        .updateOne({ _id: new ObjectId(id) }, update, { arrayFilters })
    } else {
      update = { $push: { comments: comment } }
      await mongoose.connection.db
        .collection('posts')
        .updateOne({ _id: new ObjectId(id) }, update)
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
    console.error('Error adding comment:', error)
    res.status(500).json({ message: 'Error adding comment' })
  }
}

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

    const updatedPost = await mongoose.connection.db
      .collection('posts')
      .aggregate([
        { $match: { _id: new ObjectId(postId) } },
        ...postAggregationPipeline,
      ])
      .toArray()

    res.status(200).json(updatedPost[0])
  } catch (error) {
    console.error('Error voting on comment:', error)
    res.status(500).json({ message: 'Error voting on comment' })
  }
}

module.exports = {
  getAllPosts,
  votePost,
  createPost,
  addCommentToPost,
  voteComment,
}

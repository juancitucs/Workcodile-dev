require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
const PORT = process.env.PORT
// Middlewares
app.use(cors())
app.use(express.json())

// Conexión a la base de datos
const MONGO_URI = process.env.MONGO_URI

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => console.error('MongoDB connection error:', err))

// --- Rutas ---

app.get('/', (req, res) => {
  res.send('WorkCodile Backend is running!')
})

// Heal 1 significa "incluye este camplth check endpoint for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// DB status endpoint
app.get('/api/db-status', (req, res) => {
  const dbState = mongoose.connection.readyState
  const isConnected = dbState === 1
  res.status(200).json({
    isConnected,
    state: mongoose.STATES[dbState],
  })
})

// Get all posts with author details
app.get('/api/posts', async (req, res) => {
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
      .toArray()

    res.status(200).json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    res.status(500).json({ message: 'Error fetching posts' })
  }
})

// --- Server Start ---
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`)
  })
}

// Export app for testing
// module.exports = app

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const config = require('./config/env')
const errorHandler = require('./middleware/errorHandler')

const app = express()

app.use(helmet())
app.use(compression())
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later' },
})

app.use('/api/', limiter)

mongoose.connect(config.mongo.uri)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch((err) => console.error('MongoDB connection error:', err))

const apiRoutes = require('./routes')

app.get('/', (req, res) => {
  res.send('WorkCodile Backend is running!')
})

app.use('/api', apiRoutes)

app.use(errorHandler)

if (!config.isTest) {
  app.listen(config.port, () => {
    console.log(`Backend server listening on port ${config.port}`)
  })
}

module.exports = app
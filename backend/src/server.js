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
const apiRoutes = require('./routes');

app.get('/', (req, res) => {
  res.send('WorkCodile Backend is running!')
})

app.use('/api', apiRoutes);

// --- Server Start ---
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`)
  })
}

// Export app for testing
// module.exports = app

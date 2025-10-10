require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// Ruta de ejemplo
const app = express();

// Health check endpoint for testing
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('WorkCodile Backend is running!');
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});

// Export app for testing
export { app };

const mongoose = require('mongoose');

const healthCheck = (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
};

const dbStatus = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const isConnected = dbState === 1;
  res.status(200).json({
    isConnected,
    state: mongoose.STATES[dbState],
  });
};

module.exports = {
  healthCheck,
  dbStatus,
};

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  _id: { type: String, alias: 'code' },
  name: { type: String, required: true },
  cycle: { type: Number, required: true },
  prerequisites: [{ type: String, ref: 'Course' }]
});

module.exports = mongoose.model('Course', courseSchema);

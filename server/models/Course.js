const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  level: { type: String, default: '初级' },
  cover: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  outline: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema); 
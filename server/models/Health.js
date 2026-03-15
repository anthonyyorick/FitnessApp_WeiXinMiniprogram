 // models/Health.js
const mongoose = require('mongoose');

const HealthSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['heartRate', 'bloodPressure', 'sleep', 'weight'], required: true },
  value: { type: String, required: true },
  unit: { type: String, default: '' },
  time: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Health', HealthSchema);

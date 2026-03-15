const mongoose = require('mongoose');

const SportSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['running', 'walking', 'cycling', 'swimming', 'gym'], 
    required: true 
  },
  distance: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  duration: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  steps: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  calories: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  startTime: { 
    type: Date, 
    default: Date.now 
  },
  endTime: { 
    type: Date 
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  notes: {
    type: String,
    maxlength: 500
  },
  weather: {
    temperature: Number,
    condition: String
  },
  heartRate: {
    avg: Number,
    max: Number,
    min: Number
  },
  pace: {
    avg: Number,
    best: Number
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// 更新时间中间件
SportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 虚拟字段：运动时长（分钟）
SportSchema.virtual('durationMinutes').get(function() {
  return Math.round(this.duration / 60);
});

// 虚拟字段：配速（分钟/公里）
SportSchema.virtual('pacePerKm').get(function() {
  if (this.distance > 0) {
    return (this.duration / 60) / this.distance;
  }
  return 0;
});

// 确保虚拟字段在JSON中可见
SportSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Sport', SportSchema); 
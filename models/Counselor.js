const mongoose = require('mongoose');

const CounselorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  availableDays: {
    type: [String],
    required: true
  },
  availableHours: {
    type: [String],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Counselor', CounselorSchema);
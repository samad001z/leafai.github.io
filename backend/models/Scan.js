const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for demo mode
  },
  imageUrl: {
    type: String,
    required: true,
  },
  result: {
    disease: {
      name: String,
      scientificName: String,
      confidence: Number,
      description: String,
    },
    recommendations: [String],
    severity: {
      type: String,
      enum: ['none', 'low', 'medium', 'high'],
      default: 'none',
    },
    isHealthy: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for user lookups
scanSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Scan', scanSchema);

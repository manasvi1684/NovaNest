// NovaNest/server/models/Goal.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const milestoneSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Milestone title is required.'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  targetDate: {
    type: Date,
    default: null
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  xpReward: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

const goalLogSchema = new Schema({
  content: {
    type: String,
    required: [true, 'Log content is required.'],
    trim: true
  },
  xpEarned: {
    type: Number,
    default: 5
  },
  mood: {
    type: String,
    enum: ['excellent', 'good', 'neutral', 'bad', 'terrible'],
    default: 'neutral'
  }
}, {
  timestamps: true
});

const goalSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Goal title is required.'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Goal category is required.'],
    enum: ['health', 'career', 'learning', 'personal', 'financial', 'social', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'abandoned'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  targetDate: {
    type: Date,
    default: null
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date,
    default: null
  },
  visibility: {
    type: String,
    enum: ['private', 'public', 'friends'],
    default: 'private'
  },
  milestones: [milestoneSchema],
  logs: [goalLogSchema],
  totalXp: {
    type: Number,
    default: 0
  },
  streakDays: {
    type: Number,
    default: 0
  },
  lastLogDate: {
    type: Date,
    default: null
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, category: 1 });
goalSchema.index({ userId: 1, createdAt: -1 });

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal; 
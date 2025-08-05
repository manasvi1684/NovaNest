const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  permissions: {
    canInvite: { type: Boolean, default: false },
    canManageGoals: { type: Boolean, default: true },
    canManageNotes: { type: Boolean, default: true },
    canViewAnalytics: { type: Boolean, default: true }
  }
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [teamMemberSchema],
  settings: {
    allowMemberInvites: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: true },
    defaultRole: { type: String, enum: ['member', 'admin'], default: 'member' }
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

teamSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Team', teamSchema); 
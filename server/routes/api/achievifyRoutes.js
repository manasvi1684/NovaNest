// NovaNest/server/routes/api/achievifyRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

// Load Goal Model
const Goal = require('../../models/Goal');

// --- GOALS ---

// @route   POST api/achievify/goals
// @desc    Create a new goal
// @access  Private
router.post('/goals', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      targetDate,
      visibility,
      tags,
      milestones
    } = req.body;

    if (!title) {
      return res.status(400).json({ title: 'Goal title is required.' });
    }

    const newGoal = new Goal({
      userId: req.user.id,
      title,
      description: description || '',
      category: category || 'other',
      priority: priority || 'medium',
      targetDate: targetDate || null,
      visibility: visibility || 'private',
      tags: tags || [],
      milestones: milestones || []
    });

    const goal = await newGoal.save();
    res.status(201).json(goal);
  } catch (err) {
    console.error('Error creating goal:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json(err.errors);
    }
    res.status(500).send('Server Error while creating goal');
  }
});

// @route   GET api/achievify/goals
// @desc    Get all goals for the logged-in user
// @access  Private
router.get('/goals', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = { userId: req.user.id };
    
    if (status) filter.status = status;
    if (category) filter.category = category;

    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error('Error fetching goals:', err.message);
    res.status(500).send('Server Error while fetching goals');
  }
});

// @route   GET api/achievify/goals/:goalId
// @desc    Get a specific goal by ID
// @access  Private
router.get('/goals/:goalId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.goalId)) {
      return res.status(400).json({ msg: 'Invalid Goal ID format.' });
    }

    const goal = await Goal.findOne({
      _id: req.params.goalId,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found or access denied.' });
    }

    res.json(goal);
  } catch (err) {
    console.error('Error fetching goal:', err.message);
    res.status(500).send('Server Error while fetching goal');
  }
});

// @route   PUT api/achievify/goals/:goalId
// @desc    Update a goal
// @access  Private
router.put('/goals/:goalId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.goalId)) {
      return res.status(400).json({ msg: 'Invalid Goal ID format.' });
    }

    const {
      title,
      description,
      category,
      status,
      priority,
      targetDate,
      visibility,
      tags
    } = req.body;

    let goal = await Goal.findOne({
      _id: req.params.goalId,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found or access denied for update.' });
    }

    // Update fields if provided
    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (category !== undefined) goal.category = category;
    if (status !== undefined) goal.status = status;
    if (priority !== undefined) goal.priority = priority;
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (visibility !== undefined) goal.visibility = visibility;
    if (tags !== undefined) goal.tags = tags;

    // Handle completion
    if (status === 'completed' && goal.status !== 'completed') {
      goal.completedDate = new Date();
      // Award bonus XP for completing the goal (only once)
      if (!goal._goalCompletionXpAwarded) {
        goal.totalXp += 50; // Bonus XP for completing a goal
        goal._goalCompletionXpAwarded = true;
      }
    } else if (status !== 'completed' && goal.status === 'completed') {
      goal.completedDate = null;
      // Remove bonus XP if goal is reopened
      if (goal._goalCompletionXpAwarded) {
        goal.totalXp -= 50;
        goal._goalCompletionXpAwarded = false;
      }
    }

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ title: 'Goal title cannot be empty.' });
    }

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (err) {
    console.error('Error updating goal:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json(err.errors);
    }
    res.status(500).send('Server Error while updating goal');
  }
});

// @route   DELETE api/achievify/goals/:goalId
// @desc    Delete a goal
// @access  Private
router.delete('/goals/:goalId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.goalId)) {
      return res.status(400).json({ msg: 'Invalid Goal ID format.' });
    }

    const goal = await Goal.findOne({
      _id: req.params.goalId,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found or access denied for deletion.' });
    }

    await Goal.findByIdAndDelete(req.params.goalId);
    res.json({ msg: 'Goal successfully deleted.' });
  } catch (err) {
    console.error('Error deleting goal:', err.message);
    res.status(500).send('Server Error while deleting goal');
  }
});

// --- MILESTONES ---

// @route   POST api/achievify/goals/:goalId/milestones
// @desc    Add a milestone to a goal
// @access  Private
router.post('/goals/:goalId/milestones', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.goalId)) {
      return res.status(400).json({ msg: 'Invalid Goal ID format.' });
    }

    const { title, description, targetDate, xpReward } = req.body;

    if (!title) {
      return res.status(400).json({ title: 'Milestone title is required.' });
    }

    const goal = await Goal.findOne({
      _id: req.params.goalId,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found or access denied.' });
    }

    const newMilestone = {
      title,
      description: description || '',
      targetDate: targetDate || null,
      xpReward: xpReward || 10
    };

    goal.milestones.push(newMilestone);
    const updatedGoal = await goal.save();
    
    res.status(201).json(updatedGoal);
  } catch (err) {
    console.error('Error adding milestone:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json(err.errors);
    }
    res.status(500).send('Server Error while adding milestone');
  }
});

// @route   PUT api/achievify/goals/:goalId/milestones/:milestoneId
// @desc    Update a milestone
// @access  Private
router.put('/goals/:goalId/milestones/:milestoneId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.goalId)) {
      return res.status(400).json({ msg: 'Invalid Goal ID format.' });
    }

    const { title, description, targetDate, completed, xpReward } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.goalId,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found or access denied.' });
    }

    const milestone = goal.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ msg: 'Milestone not found.' });
    }

    // Update milestone fields
    if (title !== undefined) milestone.title = title;
    if (description !== undefined) milestone.description = description;
    if (targetDate !== undefined) milestone.targetDate = targetDate;
    if (xpReward !== undefined) milestone.xpReward = xpReward;
    
    // Handle completion
    if (completed !== undefined) {
      // Only award XP if milestone was not already completed
      if (completed && !milestone.completed) {
        milestone.completed = true;
        milestone.completedAt = new Date();
        goal.totalXp += milestone.xpReward;
      } else if (!completed && milestone.completed) {
        milestone.completed = false;
        milestone.completedAt = null;
        goal.totalXp -= milestone.xpReward;
      }
    }

    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (err) {
    console.error('Error updating milestone:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json(err.errors);
    }
    res.status(500).send('Server Error while updating milestone');
  }
});

// @route   DELETE api/achievify/goals/:goalId/milestones/:milestoneId
// @desc    Delete a milestone
// @access  Private
router.delete('/goals/:goalId/milestones/:milestoneId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.goalId)) {
      return res.status(400).json({ msg: 'Invalid Goal ID format.' });
    }

    const goal = await Goal.findOne({
      _id: req.params.goalId,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found or access denied.' });
    }

    const milestone = goal.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({ msg: 'Milestone not found.' });
    }

    // Remove XP if milestone was completed
    if (milestone.completed) {
      goal.totalXp -= milestone.xpReward;
    }

    goal.milestones.pull(req.params.milestoneId);
    const updatedGoal = await goal.save();
    
    res.json(updatedGoal);
  } catch (err) {
    console.error('Error deleting milestone:', err.message);
    res.status(500).send('Server Error while deleting milestone');
  }
});

// --- LOGS ---

// @route   POST api/achievify/goals/:goalId/logs
// @desc    Add a log entry to a goal
// @access  Private
router.post('/goals/:goalId/logs', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.goalId)) {
      return res.status(400).json({ msg: 'Invalid Goal ID format.' });
    }

    const { content, xpEarned, mood } = req.body;

    if (!content) {
      return res.status(400).json({ content: 'Log content is required.' });
    }

    const goal = await Goal.findOne({
      _id: req.params.goalId,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found or access denied.' });
    }

    const newLog = {
      content,
      xpEarned: xpEarned || 5,
      mood: mood || 'neutral'
    };

    goal.logs.push(newLog);
    goal.totalXp += newLog.xpEarned;
    goal.lastLogDate = new Date();
    
    // Update streak
    const today = new Date().toDateString();
    const lastLogDate = goal.lastLogDate ? new Date(goal.lastLogDate).toDateString() : null;
    
    if (lastLogDate === today) {
      // Already logged today, don't update streak
    } else if (lastLogDate === new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()) {
      // Logged yesterday, increment streak
      goal.streakDays += 1;
    } else {
      // Break in streak, reset to 1
      goal.streakDays = 1;
    }

    const updatedGoal = await goal.save();
    res.status(201).json(updatedGoal);
  } catch (err) {
    console.error('Error adding log:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json(err.errors);
    }
    res.status(500).send('Server Error while adding log');
  }
});

// @route   DELETE api/achievify/goals/:goalId/logs/:logId
// @desc    Delete a log entry
// @access  Private
router.delete('/goals/:goalId/logs/:logId', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.goalId)) {
      return res.status(400).json({ msg: 'Invalid Goal ID format.' });
    }

    const goal = await Goal.findOne({
      _id: req.params.goalId,
      userId: req.user.id
    });

    if (!goal) {
      return res.status(404).json({ msg: 'Goal not found or access denied.' });
    }

    const log = goal.logs.id(req.params.logId);
    if (!log) {
      return res.status(404).json({ msg: 'Log not found.' });
    }

    // Remove XP from log
    goal.totalXp -= log.xpEarned;
    goal.logs.pull(req.params.logId);
    
    const updatedGoal = await goal.save();
    res.json(updatedGoal);
  } catch (err) {
    console.error('Error deleting log:', err.message);
    res.status(500).send('Server Error while deleting log');
  }
});

// --- STATS ---

// @route   GET api/achievify/stats
// @desc    Get user's achievement statistics
// @access  Private
router.get('/stats', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id });
    
    const stats = {
      totalGoals: goals.length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      totalXp: goals.reduce((sum, goal) => sum + goal.totalXp, 0),
      totalMilestones: goals.reduce((sum, goal) => sum + goal.milestones.length, 0),
      completedMilestones: goals.reduce((sum, goal) => 
        sum + goal.milestones.filter(m => m.completed).length, 0),
      totalLogs: goals.reduce((sum, goal) => sum + goal.logs.length, 0),
      longestStreak: Math.max(...goals.map(g => g.streakDays), 0),
      categoryBreakdown: goals.reduce((acc, goal) => {
        acc[goal.category] = (acc[goal.category] || 0) + 1;
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).send('Server Error while fetching stats');
  }
});

module.exports = router; 
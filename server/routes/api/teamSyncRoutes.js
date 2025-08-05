const express = require('express');
const router = express.Router();
const Team = require('../../models/Team');
const SharedGoal = require('../../models/SharedGoal');
const User = require('../../models/User');
const { authenticateToken } = require('../../config/passportConfig');

// Helper function to check if user is team member
const isTeamMember = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  return team && team.members.some(member => member.userId.toString() === userId.toString());
};

// Helper function to check if user is team admin/owner
const isTeamAdmin = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  return team && team.members.some(member => 
    member.userId.toString() === userId.toString() && 
    ['owner', 'admin'].includes(member.role)
  );
};

// Get all teams for user
router.get('/teams', authenticateToken, async (req, res) => {
  try {
    const teams = await Team.find({
      'members.userId': req.user.id
    }).populate('owner', 'username email');
    
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teams', error: error.message });
  }
});

// Create new team
router.post('/teams', authenticateToken, async (req, res) => {
  try {
    const { name, description, settings } = req.body;
    
    const team = new Team({
      name,
      description,
      owner: req.user.id,
      members: [{
        userId: req.user.id,
        role: 'owner',
        permissions: {
          canInvite: true,
          canManageGoals: true,
          canManageNotes: true,
          canViewAnalytics: true
        }
      }],
      settings: settings || {}
    });
    
    await team.save();
    await team.populate('owner', 'username email');
    
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error creating team', error: error.message });
  }
});

// Get team details
router.get('/teams/:teamId', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const team = await Team.findById(teamId)
      .populate('owner', 'username email')
      .populate('members.userId', 'username email');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team', error: error.message });
  }
});

// Update team
router.put('/teams/:teamId', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    if (!(await isTeamAdmin(teamId, req.user.id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const team = await Team.findByIdAndUpdate(
      teamId,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('owner', 'username email');
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error updating team', error: error.message });
  }
});

// Invite user to team
router.post('/teams/:teamId/invite', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email, role = 'member' } = req.body;
    
    if (!(await isTeamAdmin(teamId, req.user.id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const team = await Team.findById(teamId);
    if (team.members.some(member => member.userId.toString() === user._id.toString())) {
      return res.status(400).json({ message: 'User is already a team member' });
    }
    
    team.members.push({
      userId: user._id,
      role,
      permissions: {
        canInvite: role === 'admin',
        canManageGoals: true,
        canManageNotes: true,
        canViewAnalytics: true
      }
    });
    
    await team.save();
    res.json({ message: 'User invited successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error inviting user', error: error.message });
  }
});

// Remove user from team
router.delete('/teams/:teamId/members/:userId', authenticateToken, async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    
    if (!(await isTeamAdmin(teamId, req.user.id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const team = await Team.findById(teamId);
    team.members = team.members.filter(member => member.userId.toString() !== userId);
    
    await team.save();
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing user', error: error.message });
  }
});

// Get shared goals for team
router.get('/teams/:teamId/goals', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const goals = await SharedGoal.find({ teamId })
      .populate('assignees', 'username email')
      .populate('createdBy', 'username email')
      .populate('milestones.assignee', 'username email');
    
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shared goals', error: error.message });
  }
});

// Create shared goal
router.post('/teams/:teamId/goals', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const goal = new SharedGoal({
      ...req.body,
      teamId,
      createdBy: req.user.id
    });
    
    await goal.save();
    await goal.populate('assignees', 'username email');
    await goal.populate('createdBy', 'username email');
    
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating shared goal', error: error.message });
  }
});

// Update shared goal
router.put('/teams/:teamId/goals/:goalId', authenticateToken, async (req, res) => {
  try {
    const { teamId, goalId } = req.params;
    
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const goal = await SharedGoal.findOneAndUpdate(
      { _id: goalId, teamId },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('assignees', 'username email')
     .populate('createdBy', 'username email');
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating shared goal', error: error.message });
  }
});

// Add log to shared goal
router.post('/teams/:teamId/goals/:goalId/logs', authenticateToken, async (req, res) => {
  try {
    const { teamId, goalId } = req.params;
    const { content } = req.body;
    
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const goal = await SharedGoal.findOne({ _id: goalId, teamId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    goal.logs.push({
      userId: req.user.id,
      content,
      xpEarned: 5
    });
    
    goal.totalXp += 5;
    await goal.save();
    
    await goal.populate('logs.userId', 'username email');
    res.json(goal.logs[goal.logs.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error adding log', error: error.message });
  }
});

// Get team analytics
router.get('/teams/:teamId/analytics', authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    
    if (!(await isTeamMember(teamId, req.user.id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const goals = await SharedGoal.find({ teamId });
    const team = await Team.findById(teamId).populate('members.userId', 'username email');
    
    const analytics = {
      totalGoals: goals.length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      activeGoals: goals.filter(g => g.status === 'active').length,
      totalXp: goals.reduce((sum, g) => sum + g.totalXp, 0),
      memberCount: team.members.length,
      recentActivity: goals
        .flatMap(g => g.logs)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

module.exports = router; 
// NovaNest/client/src/pages/AchievifyPage.jsx
import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useAchievifyStore from '../store/useAchievifyStore';
import Modal from '../components/common/Modal';
import { toast } from 'react-toastify';

const AchievifyPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const {
    goals,
    stats,
    isLoadingGoals,
    isLoadingStats,
    isLoadingMutation,
    error,
    fetchGoals,
    fetchStats,
    createGoal,
    updateGoal,
    deleteGoal,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    addLog,
    deleteLog,
    clearAchievifyError,
    getActiveGoals,
    getCompletedGoals,
    getTotalXp,
    getLongestStreak
  } = useAchievifyStore();

  // Modal states
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [selectedGoalForMilestone, setSelectedGoalForMilestone] = useState(null);
  const [selectedGoalForLog, setSelectedGoalForLog] = useState(null);

  // Form states
  const [goalFormData, setGoalFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    targetDate: '',
    visibility: 'private',
    tags: []
  });

  const [milestoneFormData, setMilestoneFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
    xpReward: 10
  });

  const [logFormData, setLogFormData] = useState({
    content: '',
    xpEarned: 5,
    mood: 'neutral'
  });

  const [tagInput, setTagInput] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGoals();
      fetchStats();
    }
    return () => {
      clearAchievifyError();
    };
  }, [isAuthenticated]);

  // Completion handlers
  const handleCompleteGoal = async (goalId) => {
    try {
      await updateGoal(goalId, { status: 'completed' });
      setShowConfetti(true);
      toast.success('🎉 Goal completed! You earned bonus XP!');
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      console.error('Error completing goal:', err);
    }
  };

  const handleCompleteMilestone = async (goalId, milestoneId) => {
    try {
      await updateMilestone(goalId, milestoneId, { completed: true });
      toast.success('✅ Milestone completed! XP earned!');
    } catch (err) {
      console.error('Error completing milestone:', err);
    }
  };

  const handleReopenGoal = async (goalId) => {
    try {
      await updateGoal(goalId, { status: 'active' });
      toast.info('🔄 Goal reopened for further progress!');
    } catch (err) {
      console.error('Error reopening goal:', err);
    }
  };

  // Goal form handlers
  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...goalFormData,
        targetDate: goalFormData.targetDate || null
      };
      
      if (editingGoal) {
        await updateGoal(editingGoal._id, submitData);
      } else {
        await createGoal(submitData);
      }
      handleCloseGoalModal();
    } catch (err) {
      console.error('Goal submission error:', err);
    }
  };

  const handleOpenGoalModal = (goal = null) => {
    setEditingGoal(goal);
    if (goal) {
      setGoalFormData({
        title: goal.title || '',
        description: goal.description || '',
        category: goal.category || 'other',
        priority: goal.priority || 'medium',
        targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
        visibility: goal.visibility || 'private',
        tags: goal.tags || []
      });
    } else {
      setGoalFormData({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium',
        targetDate: '',
        visibility: 'private',
        tags: []
      });
    }
    setIsGoalModalOpen(true);
  };

  const handleCloseGoalModal = () => {
    setIsGoalModalOpen(false);
    setEditingGoal(null);
    setGoalFormData({
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      targetDate: '',
      visibility: 'private',
      tags: []
    });
    setTagInput('');
  };

  // Milestone form handlers
  const handleMilestoneSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...milestoneFormData,
        targetDate: milestoneFormData.targetDate || null
      };
      
      if (editingMilestone) {
        await updateMilestone(selectedGoalForMilestone._id, editingMilestone._id, submitData);
      } else {
        await addMilestone(selectedGoalForMilestone._id, submitData);
      }
      handleCloseMilestoneModal();
    } catch (err) {
      console.error('Milestone submission error:', err);
    }
  };

  const handleOpenMilestoneModal = (goal, milestone = null) => {
    setSelectedGoalForMilestone(goal);
    setEditingMilestone(milestone);
    if (milestone) {
      setMilestoneFormData({
        title: milestone.title || '',
        description: milestone.description || '',
        targetDate: milestone.targetDate ? new Date(milestone.targetDate).toISOString().split('T')[0] : '',
        xpReward: milestone.xpReward || 10
      });
    } else {
      setMilestoneFormData({
        title: '',
        description: '',
        targetDate: '',
        xpReward: 10
      });
    }
    setIsMilestoneModalOpen(true);
  };

  const handleCloseMilestoneModal = () => {
    setIsMilestoneModalOpen(false);
    setSelectedGoalForMilestone(null);
    setEditingMilestone(null);
    setMilestoneFormData({
      title: '',
      description: '',
      targetDate: '',
      xpReward: 10
    });
  };

  // Log form handlers
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    try {
      await addLog(selectedGoalForLog._id, logFormData);
      handleCloseLogModal();
    } catch (err) {
      console.error('Log submission error:', err);
    }
  };

  const handleOpenLogModal = (goal) => {
    setSelectedGoalForLog(goal);
    setLogFormData({
      content: '',
      xpEarned: 5,
      mood: 'neutral'
    });
    setIsLogModalOpen(true);
  };

  const handleCloseLogModal = () => {
    setIsLogModalOpen(false);
    setSelectedGoalForLog(null);
    setLogFormData({
      content: '',
      xpEarned: 5,
      mood: 'neutral'
    });
  };

  // Tag handlers
  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = tagInput.trim();
    if (tag && !goalFormData.tags.includes(tag)) {
      setGoalFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setGoalFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  // Utility functions
  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      abandoned: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      health: '🏃‍♂️',
      career: '💼',
      learning: '📚',
      personal: '🎯',
      financial: '💰',
      social: '👥',
      other: '⭐'
    };
    return icons[category] || '⭐';
  };

  const getMoodIcon = (mood) => {
    const icons = {
      excellent: '😄',
      good: '🙂',
      neutral: '😐',
      bad: '😔',
      terrible: '😢'
    };
    return icons[mood] || '😐';
  };

  const calculateProgress = (goal) => {
    if (goal.milestones.length === 0) return 0;
    const completed = goal.milestones.filter(m => m.completed).length;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-purple-700">Achievify - Gamified Goal Tracker</h1>
        <p className="text-gray-600">Level up your life with goals, milestones, and XP rewards!</p>
      </header>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 animate-fade-in">
          <div className="flex items-center">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-100">Active Goals</p>
              <p className="text-2xl font-bold text-white">{getActiveGoals().length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-green-600 p-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-100">Total XP</p>
              <p className="text-2xl font-bold text-white">{getTotalXp()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-100">Longest Streak</p>
              <p className="text-2xl font-bold text-white">{getLongestStreak()} days</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-100">Completed</p>
              <p className="text-2xl font-bold text-white">{getCompletedGoals().length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Goal Button */}
      <div className="mb-6 text-center">
        <button
          onClick={() => handleOpenGoalModal()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-8 rounded-full focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105 shadow-lg animate-pulse"
        >
          ✨ + Create New Goal
        </button>
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              {['🎉', '🎊', '⭐', '🏆', '💎'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingGoals ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-500">Loading your goals...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="col-span-full text-center py-8 animate-fade-in">
            <div className="text-6xl mb-4 animate-bounce">🎯</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-500">Create your first goal to start your achievement journey!</p>
          </div>
        ) : (
          goals.map((goal, index) => (
            <div 
              key={goal._id} 
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6">
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getCategoryIcon(goal.category)}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                      <p className="text-sm text-gray-500 capitalize">{goal.category}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleOpenGoalModal(goal)}
                      className="text-gray-400 hover:text-purple-600"
                      title="Edit goal"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this goal?')) {
                          deleteGoal(goal._id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-600"
                      title="Delete goal"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Goal Description */}
                {goal.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{goal.description}</p>
                )}

                {/* Status and Priority */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                    {goal.priority}
                  </span>
                </div>

                {/* Progress Bar */}
                {goal.milestones.length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{calculateProgress(goal)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProgress(goal)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* XP and Streak */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">⭐ {goal.totalXp} XP</span>
                    {goal.streakDays > 0 && (
                      <span className="flex items-center">
                        🔥 {goal.streakDays} day{goal.streakDays !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {goal.status === 'active' && (
                    <button
                      onClick={() => handleCompleteGoal(goal._id)}
                      className="flex-1 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      🏆 Complete Goal
                    </button>
                  )}
                  {goal.status === 'completed' && (
                    <button
                      onClick={() => handleReopenGoal(goal._id)}
                      className="flex-1 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      🔄 Reopen Goal
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenMilestoneModal(goal)}
                    className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium py-2 px-3 rounded-md transition-all duration-300 transform hover:scale-105"
                  >
                    ➕ Add Milestone
                  </button>
                  <button
                    onClick={() => handleOpenLogModal(goal)}
                    className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-medium py-2 px-3 rounded-md transition-all duration-300 transform hover:scale-105"
                  >
                    📝 Add Log
                  </button>
                </div>

                {/* Milestones Section */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Milestones:</h4>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone) => (
                        <div key={milestone._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            <span className={`mr-2 ${milestone.completed ? 'text-green-600' : 'text-gray-400'}`}>
                              {milestone.completed ? '✅' : '⭕'}
                            </span>
                            <span className={`text-sm ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {milestone.title}
                            </span>
                          </div>
                          {!milestone.completed && (
                            <button
                              onClick={() => handleCompleteMilestone(goal._id, milestone._id)}
                              className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {goal.tags && goal.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {goal.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Goal Form Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={handleCloseGoalModal}
        title={editingGoal ? 'Edit Goal' : 'Create New Goal'}
      >
        <form onSubmit={handleGoalSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title *</label>
            <input
              type="text"
              value={goalFormData.title}
              onChange={(e) => setGoalFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your goal title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={goalFormData.description}
              onChange={(e) => setGoalFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe your goal"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={goalFormData.category}
                onChange={(e) => setGoalFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="health">Health</option>
                <option value="career">Career</option>
                <option value="learning">Learning</option>
                <option value="personal">Personal</option>
                <option value="financial">Financial</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={goalFormData.priority}
                onChange={(e) => setGoalFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
            <input
              type="date"
              value={goalFormData.targetDate}
              onChange={(e) => setGoalFormData(prev => ({ ...prev, targetDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Add
              </button>
            </div>
            {goalFormData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {goalFormData.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500 focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseGoalModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
            >
              {editingGoal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Milestone Form Modal */}
      <Modal
        isOpen={isMilestoneModalOpen}
        onClose={handleCloseMilestoneModal}
        title={editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
      >
        <form onSubmit={handleMilestoneSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Milestone Title *</label>
            <input
              type="text"
              value={milestoneFormData.title}
              onChange={(e) => setMilestoneFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter milestone title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={milestoneFormData.description}
              onChange={(e) => setMilestoneFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Describe this milestone"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
              <input
                type="date"
                value={milestoneFormData.targetDate}
                onChange={(e) => setMilestoneFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">XP Reward</label>
              <input
                type="number"
                value={milestoneFormData.xpReward}
                onChange={(e) => setMilestoneFormData(prev => ({ ...prev, xpReward: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseMilestoneModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700"
            >
              {editingMilestone ? 'Update Milestone' : 'Add Milestone'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Form Modal */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={handleCloseLogModal}
        title="Add Progress Log"
      >
        <form onSubmit={handleLogSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Log Content *</label>
            <textarea
              value={logFormData.content}
              onChange={(e) => setLogFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="What progress did you make today?"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">XP Earned</label>
              <input
                type="number"
                value={logFormData.xpEarned}
                onChange={(e) => setLogFormData(prev => ({ ...prev, xpEarned: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
              <select
                value={logFormData.mood}
                onChange={(e) => setLogFormData(prev => ({ ...prev, mood: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="excellent">😄 Excellent</option>
                <option value="good">🙂 Good</option>
                <option value="neutral">😐 Neutral</option>
                <option value="bad">😔 Bad</option>
                <option value="terrible">😢 Terrible</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseLogModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
            >
              Add Log
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AchievifyPage; 
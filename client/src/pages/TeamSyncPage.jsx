import React, { useEffect, useState } from 'react';
import useTeamSyncStore from '../store/useTeamSyncStore';
import { toast } from 'react-toastify';

const TeamSyncPage = () => {
  const {
    teams,
    selectedTeam,
    sharedGoals,
    teamAnalytics,
    loading,
    error,
    fetchTeams,
    createTeam,
    selectTeam,
    inviteUser,
    createSharedGoal,
    updateSharedGoal,
    addGoalLog,
    fetchTeamAnalytics
  } = useTeamSyncStore();

  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateGoalModal, setShowCreateGoalModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await createTeam(formData);
      setShowCreateTeamModal(false);
      setFormData({});
      toast.success('Team created successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    try {
      await inviteUser(selectedTeam._id, formData.email, formData.role);
      setShowInviteModal(false);
      setFormData({});
      toast.success('User invited successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    try {
      await createSharedGoal(selectedTeam._id, formData);
      setShowCreateGoalModal(false);
      setFormData({});
      toast.success('Shared goal created successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    try {
      await addGoalLog(selectedTeam._id, selectedGoal._id, formData.content);
      setShowLogModal(false);
      setFormData({});
      setSelectedGoal(null);
      toast.success('Log added successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleCompleteGoal = async (goalId) => {
    try {
      await updateSharedGoal(selectedTeam._id, goalId, { status: 'completed' });
      toast.success('Goal completed! 🎉');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 md:py-8 px-2 md:px-4">
      <div className="container mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 md:mb-8 text-center gradient-text">
          TeamSync - Collaborative Productivity
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
          {/* Teams Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Teams</h2>
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  + New Team
                </button>
              </div>

              <div className="space-y-3">
                {teams.map((team) => (
                  <div
                    key={team._id}
                    onClick={() => selectTeam(team._id)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-md ${
                      selectedTeam?._id === team._id
                        ? 'bg-blue-100 border-2 border-blue-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800">{team.name}</h3>
                    <p className="text-sm text-gray-600">{team.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {team.members.length} members
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedTeam ? (
              <div className="space-y-8">
                {/* Team Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        {selectedTeam.name}
                      </h2>
                      <p className="text-gray-600">{selectedTeam.description}</p>
                    </div>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      Invite Member
                    </button>
                  </div>

                  {/* Team Members */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Members</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedTeam.members.map((member) => (
                        <div
                          key={member.userId._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-800">
                              {member.userId.username}
                            </p>
                            <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {member.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team Analytics */}
                  {teamAnalytics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                        <h4 className="text-sm font-medium">Total Goals</h4>
                        <p className="text-2xl font-bold">{teamAnalytics.totalGoals}</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                        <h4 className="text-sm font-medium">Completed</h4>
                        <p className="text-2xl font-bold">{teamAnalytics.completedGoals}</p>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
                        <h4 className="text-sm font-medium">Active</h4>
                        <p className="text-2xl font-bold">{teamAnalytics.activeGoals}</p>
                      </div>
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg">
                        <h4 className="text-sm font-medium">Total XP</h4>
                        <p className="text-2xl font-bold">{teamAnalytics.totalXp}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Shared Goals */}
                <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Shared Goals</h2>
                    <button
                      onClick={() => setShowCreateGoalModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      + New Goal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sharedGoals.map((goal) => (
                      <div
                        key={goal._id}
                        className="border rounded-lg p-4 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              goal.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : goal.status === 'active'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {goal.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-500">
                            XP: {goal.totalXp}
                          </span>
                          <span className="text-sm text-gray-500">
                            {goal.assignees.length} assignees
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          {goal.status === 'active' && (
                            <button
                              onClick={() => handleCompleteGoal(goal._id)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded transition-all duration-300"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedGoal(goal);
                              setShowLogModal(true);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-all duration-300"
                          >
                            Add Log
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-fade-in">
                <div className="text-6xl mb-6">👥</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Select a Team
                </h2>
                <p className="text-gray-600 mb-6">
                  Choose a team from the sidebar to view shared goals and collaborate with your team members.
                </p>
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Create Your First Team
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create Team Modal */}
        {showCreateTeamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Team</h3>
              <form onSubmit={handleCreateTeam}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    rows="3"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Create Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateTeamModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invite User Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Invite Team Member</h3>
              <form onSubmit={handleInviteUser}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Role
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={formData.role || 'member'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Send Invite
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Goal Modal */}
        {showCreateGoalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Create Shared Goal</h3>
              <form onSubmit={handleCreateGoal}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    rows="3"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    value={formData.priority || 'medium'}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Create Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateGoalModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Log Modal */}
        {showLogModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Add Log to "{selectedGoal?.title}"
              </h3>
              <form onSubmit={handleAddLog}>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Log Content
                  </label>
                  <textarea
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    rows="4"
                    placeholder="What progress did you make on this goal?"
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Add Log
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLogModal(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamSyncPage; 
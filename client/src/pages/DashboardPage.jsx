// NovaNest/client/src/pages/DashboardPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const DashboardPage = () => {
  // Get the user object from the auth store
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); // Good to also have for conditional rendering

  // The ProtectedRoute should ensure that if we reach this page, isAuthenticated is true
  // and 'user' should be populated (either from login or from fetchUser on app load).

  if (!isAuthenticated || !user) {
    // This should ideally not be hit if ProtectedRoute is working correctly
    // and if fetchUser populates 'user' on load.
    // However, as a fallback or if there's a brief moment before user data is fully loaded
    // into the store by an async fetchUser after rehydration.
    // App.jsx's global loader should cover most of this.
    return (
      <div className="p-4">
        <h2 className="text-2xl font-semibold text-gray-700">Dashboard</h2>
        <p className="text-gray-600">Loading user data or not authenticated...</p>
        {/* Optionally, you could add a link to login here if !isAuthenticated,
            but ProtectedRoute should handle the redirect. */}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 md:py-12">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">Welcome to your NovaNest Dashboard, {user.username}!</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
        {/* User Details Card */}
        <div className="bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Your Profile</h2>
          <p className="text-gray-700 mb-1"><strong>User ID:</strong> {user.id || user._id}</p>
          <p className="text-gray-700 mb-1"><strong>Email:</strong> {user.email}</p>
          <p className="text-gray-700 mb-1"><strong>Roles:</strong> {user.roles?.join(', ')}</p>
          <p className="text-gray-700">
            <strong>Accessible Modules:</strong> {user.accessibleModules?.join(', ') || 'Not specified'}
          </p>
          {user.createdAt && (
            <p className="text-sm text-gray-500 mt-3">
              Member since: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Module Quick Access */}
        <div className="bg-gray-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">Quick Access</h2>
          <div className="grid grid-cols-1 gap-3">
            <Link 
              to="/thinktrek" 
              className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mr-3">📝</span>
              <div>
                <h3 className="font-medium text-gray-900">ThinkTrek</h3>
                <p className="text-sm text-gray-500">Journal & Thought Mapping</p>
              </div>
            </Link>
            
            <Link 
              to="/bugtrace" 
              className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mr-3">🐛</span>
              <div>
                <h3 className="font-medium text-gray-900">BugTrace</h3>
                <p className="text-sm text-gray-500">Personal Issue Tracker</p>
              </div>
            </Link>
            
            <Link 
              to="/achievify" 
              className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-2xl mr-3">🏆</span>
              <div>
                <h3 className="font-medium text-gray-900">Achievify</h3>
                <p className="text-sm text-gray-500">Goal Tracking & Gamification</p>
              </div>
            </Link>
            <Link to="/analytics" className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <h3 className="font-medium text-gray-900">Analytics</h3>
                <p className="text-sm text-gray-500">Productivity Insights & Charts</p>
              </div>
            </Link>
            <Link to="/teamsync" className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl mr-3">👥</span>
              <div>
                <h3 className="font-medium text-gray-900">TeamSync</h3>
                <p className="text-sm text-gray-500">Team Collaboration & Goals</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Placeholder for where actual module content might be embedded or linked */}
      <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
        <h3 className="text-lg font-semibold text-indigo-700">Your Workspace</h3>
        <p className="text-indigo-600">
          The main content for your selected module (ThinkTrek, BugTrace, Achievify) will appear here or on dedicated pages.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
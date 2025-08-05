// NovaNest/client/src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const features = [
  {
    title: 'ThinkTrek',
    icon: '📝',
    description: 'Capture your thoughts, ideas, and knowledge with rich markdown, tagging, and visual organization.',
    color: 'from-indigo-400 to-purple-500',
    link: '/thinktrek',
    bullets: ['Markdown editor', 'Tagging & backlinks', 'Visual knowledge map']
  },
  {
    title: 'BugTrace',
    icon: '🐛',
    description: 'Track personal dev tasks, bugs, and projects with Kanban and issue management.',
    color: 'from-teal-400 to-cyan-500',
    link: '/bugtrace',
    bullets: ['Kanban board', 'Issue linking', 'Sprint overview']
  },
  {
    title: 'Achievify',
    icon: '🏆',
    description: 'Gamify your goals with XP, streaks, milestones, and progress tracking to stay motivated.',
    color: 'from-pink-400 to-yellow-500',
    link: '/achievify',
    bullets: ['XP & streaks', 'Milestones', 'Achievement badges']
  },
  {
    title: 'TeamSync',
    icon: '👥',
    description: 'Collaborate with your team on shared goals, track progress, and manage team productivity.',
    color: 'from-orange-400 to-red-500',
    link: '/teamsync',
    bullets: ['Team management', 'Shared goals', 'Team analytics']
  }
];

const HomePage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6 gradient-text">
            Welcome to <span className="text-indigo-600">NovaNest</span>
          </h1>
          <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto">
            Your modular productivity OS - a unified platform for journaling, issue tracking, and goal achievement.
            Built for creators, developers, and thinkers who want to organize their digital life.
          </p>
          {!isAuthenticated ? (
            <div className="flex justify-center space-x-4">
              <Link 
                to="/register" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Get Started
              </Link>
              <Link 
                to="/login" 
                className="bg-white hover:bg-gray-50 text-indigo-600 font-bold py-3 px-8 rounded-lg border-2 border-indigo-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <Link 
              to="/dashboard" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Go to Dashboard
            </Link>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className={`glass bg-gradient-to-br ${feature.color} p-8 rounded-2xl shadow-xl hover-lift border border-white/30 animate-fade-in`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="text-6xl mb-6 animate-bounce" style={{ animationDelay: `${idx * 0.2}s` }}>{feature.icon}</div>
              <h3 className="text-2xl font-bold text-blue-600 mb-4 drop-shadow-lg">{feature.title}</h3>
              <p className="text-gray-800 mb-6 leading-relaxed font-medium">{feature.description}</p>
              <ul className="mb-6 space-y-2">
                {feature.bullets.map((b, i) => (
                  <li key={i} className="flex items-center text-gray-800 text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="font-medium">{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={feature.link}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Try Now
              </Link>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Built with Modern Tech</h2>
          <div className="flex justify-center flex-wrap gap-4 text-sm">
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">React</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Node.js</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">MongoDB</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Express</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Tailwind CSS</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">Zustand</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
// NovaNest/client/src/pages/AnalyticsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import useAchievifyStore from '../store/useAchievifyStore';
import { Link } from 'react-router-dom';

// Mock module usage data
const moduleUsage = [
  { label: 'ThinkTrek', value: 42, color: '#6366f1' },
  { label: 'BugTrace', value: 28, color: '#14b8a6' },
  { label: 'Achievify', value: 30, color: '#f59e42' },
];

// Simple streak heatmap generator (last 30 days)
function StreakHeatmap({ streakDays }) {
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    return d;
  });
  // For demo, mark streakDays as filled from today backwards
  return (
    <div className="grid grid-cols-10 gap-1">
      {days.map((d, i) => (
        <div
          key={d.toISOString()}
          title={d.toLocaleDateString()}
          className={`w-5 h-5 rounded-md border border-gray-200 ${i >= 30 - streakDays ? 'bg-green-400' : 'bg-gray-200'}`}
        ></div>
      ))}
    </div>
  );
}

const AnalyticsDashboard = () => {
  const { stats, fetchStats, goals } = useAchievifyStore();
  const [xpHistory, setXpHistory] = useState([]);

  useEffect(() => {
    fetchStats();
    // Mock XP history for demo (replace with real data if available)
    setXpHistory(Array.from({ length: 14 }, (_, i) => 100 + i * 20 + Math.floor(Math.random() * 30)));
  }, []);

  // XP over time (line chart)
  const xpData = {
    labels: Array.from({ length: xpHistory.length }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: 'XP Earned',
        data: xpHistory,
        fill: true,
        backgroundColor: 'rgba(99,102,241,0.1)',
        borderColor: '#6366f1',
        tension: 0.4,
      },
    ],
  };

  // Goal/milestone completion (pie chart)
  const completionData = {
    labels: ['Completed Goals', 'Active Goals', 'Completed Milestones'],
    datasets: [
      {
        data: [stats?.completedGoals || 0, stats?.activeGoals || 0, stats?.completedMilestones || 0],
        backgroundColor: ['#10b981', '#6366f1', '#f59e42'],
        borderWidth: 1,
      },
    ],
  };

  // Module usage (pie chart)
  const moduleData = {
    labels: moduleUsage.map(m => m.label),
    datasets: [
      {
        data: moduleUsage.map(m => m.value),
        backgroundColor: moduleUsage.map(m => m.color),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 gradient-text text-center">Productivity Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* XP Over Time */}
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-indigo-700">XP Over Time</h2>
            <Line data={xpData} />
          </div>
          {/* Goal/Milestone Completion */}
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-green-700">Goal & Milestone Completion</h2>
            <Pie data={completionData} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Streak Heatmap */}
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-orange-700">Streak Heatmap (Last 30 Days)</h2>
            <StreakHeatmap streakDays={stats?.longestStreak || 0} />
          </div>
          {/* Module Usage */}
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-teal-700">Module Usage Breakdown</h2>
            <Pie data={moduleData} />
          </div>
        </div>
        <div className="text-center mt-8">
          <Link to="/dashboard" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-lg animate-pulse-glow">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 
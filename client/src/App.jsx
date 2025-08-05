// NovaNest/client/src/App.jsx
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useAuthStore from './store/authStore';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ThinkTrekPage from './pages/ThinkTrekPage';
import BugTracePage from './pages/BugTracePage';
import AchievifyPage from './pages/AchievifyPage';
import NotFoundPage from './pages/NotFoundPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import TeamSyncPage from './pages/TeamSyncPage';
import CommandPalette from './components/common/CommandPalette';


function App() {
  const initializeAuth = useAuthStore((state) => state.fetchUser);
  const isAuthCheckComplete = useAuthStore((state) => state.isAuthCheckComplete);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuthCheckComplete && isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f0f0' }}>
        <h2 style={{ color: '#333', fontFamily: 'Arial, sans-serif' }}>Loading NovaNest...</h2>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false}
        closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored"
      />
      <CommandPalette />
      <main style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/thinktrek" element={<ThinkTrekPage />} />
            <Route path="/bugtrace" element={<BugTracePage />} />
            <Route path="/achievify" element={<AchievifyPage />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/teamsync" element={<TeamSyncPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
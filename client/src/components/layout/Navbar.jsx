// NovaNest/client/src/components/layout/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import NotificationCenter from '../common/NotificationCenter';

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = (
    <>
      <Link to="/" className="hover:text-indigo-200" onClick={() => setMenuOpen(false)}>Home</Link>
      {isAuthenticated && (
        <>
          <Link to="/dashboard" className="hover:text-indigo-200" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link to="/thinktrek" className="hover:text-indigo-200" onClick={() => setMenuOpen(false)}>ThinkTrek</Link>
          <Link to="/bugtrace" className="hover:text-indigo-200" onClick={() => setMenuOpen(false)}>BugTrace</Link>
          <Link to="/achievify" className="hover:text-indigo-200" onClick={() => setMenuOpen(false)}>Achievify</Link>
          <Link to="/analytics" className="hover:text-indigo-200" onClick={() => setMenuOpen(false)}>Analytics</Link>
          <Link to="/teamsync" className="hover:text-indigo-200" onClick={() => setMenuOpen(false)}>TeamSync</Link>
        </>
      )}
      {isAuthenticated ? (
        <>
          {user && <span className="hidden sm:inline">Welcome, {user.username}!</span>}
          <NotificationCenter />
          <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2 sm:mt-0">
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="hover:text-indigo-200" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/register" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-2 sm:mt-0" onClick={() => setMenuOpen(false)}>
            Register
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-indigo-200">
          NovaNest
        </Link>
        {/* Hamburger for mobile/tablet */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-4">{navLinks}</div>
      </div>
      {/* Mobile/tablet dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-indigo-700 px-6 pb-4 flex flex-col space-y-2 animate-fade-in">
          {navLinks}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
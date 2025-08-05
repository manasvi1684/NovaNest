// NovaNest/client/src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { register as registerApiService } from '../services/authService'; // Import the API service

const RegisterPage = () => {
  const navigate = useNavigate();
  const { loginSuccess, authError, setLoading, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { username, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) useAuthStore.getState().clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      authError("Passwords do not match!"); // Use store action for consistency
      return;
    }
    setLoading(true);
    try {
      const responseData = await registerApiService({ username, email, password });
      // Our backend registration currently doesn't log the user in directly or return a token.
      // It returns { msg: 'User registered successfully!', user: userResponse }
      // For now, after successful registration, let's redirect to login.
      // Later, we could choose to auto-login and call loginSuccess.
      alert(responseData.msg || 'Registration successful! Please log in.'); // Simple alert for now
      navigate('/login');
    } catch (err) {
      // authError action is already called by the service if it throws an error
      // that our handleResponse creates. If not, we call it here.
      // The error from handleResponse should be err.message
      authError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg sm:w-full md:w-1/2 lg:w-1/3">
        <h3 className="text-2xl font-bold text-center text-indigo-600">Create your NovaNest Account</h3>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <div className="mt-4">
            <div>
              <label className="block text-gray-700" htmlFor="username">Username</label>
              <input
                type="text"
                placeholder="Username"
                name="username"
                value={username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700" htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700" htmlFor="password">Password</label>
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={handleChange}
                minLength="6"
                required
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700" htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                minLength="6"
                required
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-2 mt-4 text-white bg-indigo-600 rounded-lg hover:bg-indigo-900 disabled:bg-indigo-300"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
            <div className="mt-6 text-grey-dark">
              Already have an account?
              <Link className="text-indigo-600 hover:underline ml-1" to="/login">
                Log in
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
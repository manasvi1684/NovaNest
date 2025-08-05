// NovaNest/client/src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { login as loginApiService } from '../services/authService';
// No need to import toast here if authStore actions handle it, unless you want page-specific toasts

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Select actions and state from Zustand store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const authError = useAuthStore((state) => state.authError);
  const setLoading = useAuthStore((state) => state.setLoading); // Crucial selector
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { email, password } = formData;

  useEffect(() => {
    if (isAuthenticated) {
      const fromPath = location.state?.from?.pathname || '/dashboard';
      navigate(fromPath, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) {
      clearError(); // Clear store error when user starts typing
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
        authError("Email and password are required."); // This will set store error & trigger toast
        return;
    }

    // console.log('LOGIN_PAGE: handleSubmit - Calling setLoading(true). Type of setLoading:', typeof setLoading);
    setLoading(true); // Call the action from the store

    try {
      const responseData = await loginApiService({ email, password });
      // responseData from backend: { success, msg, token, user }
      if (responseData.success && responseData.token && responseData.user) {
        loginSuccess(responseData.user, responseData.token); // This sets isLoading to false and shows success toast
      } else {
        // This case would be if backend responds 200 OK but with success: false
        authError(responseData.msg || 'Login failed. Invalid response from server.');
      }
    } catch (err) {
      // This catch block handles errors thrown by loginApiService (e.g., network errors, or errors from handleResponse)
      // authError will set isLoading to false and show an error toast.
      authError(err.message || 'Login failed. Please try again.');
    }
    // No 'finally { setLoading(false) }' needed here because loginSuccess and authError in the store
    // are already responsible for setting isLoading to false.
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg sm:w-full md:w-1/2 lg:w-1/3">
        <h3 className="text-2xl font-bold text-center text-indigo-600">Login to NovaNest</h3>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
          <div className="mt-4">
            <div>
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
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-2 mt-4 text-white bg-indigo-600 rounded-lg hover:bg-indigo-900 disabled:bg-indigo-300"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
            <div className="mt-6 text-grey-dark">
              Need an account?
              <Link className="text-indigo-600 hover:underline ml-1" to="/register">
                Register
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
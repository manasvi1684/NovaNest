// NovaNest/client/src/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getMe as getMeApiService } from '../services/authService'; // Ensure login/register services are also imported if used directly by store actions
// import { login as loginApiService, register as registerApiService } from '../services/authService'; // Example if you had separate service calls
import { toast } from 'react-toastify';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // --- State ---
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false, // General loading for auth actions
      error: null,
      isAuthCheckComplete: false,

      // --- Actions ---
      loginSuccess: (userData, token) => {
        // console.log("AUTH_STORE: loginSuccess called", { userData, token });
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
          isLoading: false, // Ensure isLoading is set to false
          error: null,
          isAuthCheckComplete: true,
        });
        toast.success(`Welcome back, ${userData.username}!`);
      },

      // This action is typically called by form submit handlers on error
      authError: (errorMessage) => {
        // console.log("AUTH_STORE: authError called with:", errorMessage);
        set({
          error: errorMessage,
          isLoading: false, // Ensure isLoading is set to false
          isAuthenticated: false,
          user: null,
          token: null,
          // isAuthCheckComplete: true, // Let fetchUser or loginSuccess handle this after an attempt
        });
        toast.error(errorMessage || 'An authentication error occurred.');
      },

      logout: () => {
        // console.log("AUTH_STORE: logout called");
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isAuthCheckComplete: true,
        });
        toast.info("You have been logged out.");
      },

      // Action to be called by components to indicate loading start/end for auth operations
      setLoading: (loadingStatus) => {
        // console.log("AUTH_STORE: setLoading called with:", loadingStatus);
        set({ isLoading: loadingStatus });
      },

      clearError: () => {
        // console.log("AUTH_STORE: clearError called");
        set({ error: null });
      },

      fetchUser: async () => {
        const token = get().token;
        // console.log('AUTH_STORE: fetchUser (initializeAuth) called. Token:', token);

        if (!get().isAuthCheckComplete) {
            set({ isLoading: true });
        }

        if (!token) {
          // console.log('AUTH_STORE: No token in fetchUser.');
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            isAuthCheckComplete: true,
          });
          return;
        }

        try {
          const userData = await getMeApiService(token);
          // console.log('AUTH_STORE: getMeApiService success in fetchUser. User data:', userData);
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isAuthCheckComplete: true,
          });
        } catch (error) {
          // console.error("AUTH_STORE: Error in fetchUser (getMeApiService failed):", error.message);
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isAuthCheckComplete: true,
            // error: 'Session expired or invalid. Please log in again.', // Can set error here too
          });
          // Do not toast here for background check failure, let login page handle explicit login errors.
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
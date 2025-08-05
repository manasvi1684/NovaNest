// NovaNest/client/src/components/ProtectedRoute.jsx
import React from 'react'; // Removed useEffect as logging is now optional
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = () => {
  // By the time this component is rendered for a route decision (after initial app load),
  // isAuthCheckComplete should be true, and isAuthenticated reflects the verified state.
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthCheckComplete = useAuthStore((state) => state.isAuthCheckComplete); // For robustness

  const location = useLocation();

  // This console.log can be helpful during debugging
  // console.log(
  //   'PROTECTED_ROUTE: Evaluating. Path:', location.pathname,
  //   'isAuthenticated:', isAuthenticated,
  //   'isAuthCheckComplete:', isAuthCheckComplete
  // );

  // If the initial auth check isn't complete yet, don't make a redirect decision.
  // App.jsx should be showing a loading screen.
  // However, if somehow this component renders before App.jsx's loading screen logic fully kicks in
  // or if isAuthCheckComplete flips back to false unexpectedly, this prevents premature redirects.
  if (!isAuthCheckComplete) {
    // console.log("PROTECTED_ROUTE: Auth check not complete, rendering null (App should show loader)");
    // It's better if App.jsx handles the global loading screen.
    // Returning null here might cause a blank screen if App.jsx isn't showing its loader.
    // For now, let App.jsx handle the loading screen. If isAuthCheckComplete is false,
    // the routes shouldn't even be rendered by App.jsx.
    // So this condition might be redundant if App.jsx is structured correctly.
    // However, for safety:
    // return <div>Verifying authentication...</div>; // Or null, if App.jsx handles loading
  }


  if (!isAuthenticated && isAuthCheckComplete) { // Only redirect if check is complete and not authenticated
    // console.log('PROTECTED_ROUTE: Not authenticated AND auth check complete, redirecting to /login from', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated (and check is complete), or if check is not yet complete (App.jsx shows loader)
  // console.log('PROTECTED_ROUTE: Authenticated or auth check pending, rendering Outlet for', location.pathname);
  return <Outlet />;
};

export default ProtectedRoute;
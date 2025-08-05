// NovaNest/client/src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div>
      <h2>404 - Page Not Found</h2>
      <p>Oops! The page you are looking for does not exist.</p>
      <Link to="/">Go to Homepage</Link>
    </div>
  );
};
export default NotFoundPage;
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div className="container loading"><div className="spinner"></div></div>;

  if (!user) {
    // Redirect them to the /profile page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

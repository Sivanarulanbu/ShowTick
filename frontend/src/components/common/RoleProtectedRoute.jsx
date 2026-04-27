import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div className="container loading"><div className="spinner"></div></div>;

  if (!user) {
    return <Navigate to="/profile" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not allowed, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleProtectedRoute;

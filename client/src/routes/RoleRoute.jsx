import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="skeleton" style={{ width: 120, height: 24 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

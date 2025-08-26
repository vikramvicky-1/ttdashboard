import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, requiredRole, fallback = null }) => {
  const { user, hasPermission, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    if (fallback) {
      return fallback;
    }
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    toast.error(`Access denied. ${requiredRole} role required.`);
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Insufficient Permissions</h2>
          <p className="text-gray-600">
            You need <span className="font-semibold text-red-600">{requiredRole}</span> role or higher to access this page.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Your current role: <span className="font-medium">{user.role}</span>
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;

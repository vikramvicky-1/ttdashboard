import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../Library/Axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Role hierarchy for permission checking
  const roleHierarchy = {
    admin: 3,
    accountant: 2,
    staff: 1
  };

  useEffect(() => {
    // Check if user is logged in on app start
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Verify token with backend (you would implement this endpoint)
        // For now, we'll simulate with stored user data
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // This would be replaced with actual login API call
      // For demo purposes, we'll simulate login
      const mockUser = {
        _id: '1',
        name: 'Admin User',
        email: email,
        role: 'admin',
        profilePicture: null
      };

      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('userData', JSON.stringify(mockUser));
      
      setUser(mockUser);
      setIsAuthenticated(true);
      
      toast.success('Login successful');
      return { success: true };
    } catch (error) {
      toast.error('Login failed');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  const hasPermission = (requiredRole) => {
    if (!user || !user.role) return false;
    
    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
  };

  const canManageUsers = () => {
    return hasPermission('admin');
  };

  const canManageCategories = () => {
    return hasPermission('accountant');
  };

  const canViewReports = () => {
    return hasPermission('accountant');
  };

  const canAddExpenses = () => {
    return hasPermission('staff');
  };

  const canAddSales = () => {
    return hasPermission('staff');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    canManageUsers,
    canManageCategories,
    canViewReports,
    canAddExpenses,
    canAddSales,
    roleHierarchy
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

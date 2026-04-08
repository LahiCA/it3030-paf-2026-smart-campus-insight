import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginWithGoogle, logout, getCurrentUser } from '../services/auth';
import { getUser, getToken, isAuthenticated as checkAuth } from '../services/storage';

/**
 * AuthContext
 * 
 * Manages authentication state globally
 * Provides:
 * - Current user data
 * - Authentication status
 * - Login/logout functions
 * - User role checking
 */

const AuthContext = createContext();

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize auth state from storage on mount
   */
  useEffect(() => {
    const initAuth = () => {
      try {
        if (checkAuth()) {
          const storedUser = getUser();
          const token = getToken();
          
          if (storedUser && token) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Token exists but user data missing - fetch it
            fetchCurrentUser();
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for logout events from other tabs/windows
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  /**
   * Fetch current user profile
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const result = await getCurrentUser();
      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle Google login
   */
  const handleLogin = useCallback(async (googleToken) => {
    setLoading(true);
    setError(null);

    try {
      const result = await loginWithGoogle(googleToken);

      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
        return { success: true, message: result.message, firstLogin: result.firstLogin };
      } else {
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle logout
   */
  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role) => {
    if (!user) return false;
    return user.role === role || (Array.isArray(role) && role.includes(user.role));
  }, [user]);

  /**
   * Check if user is admin
   */
  const isAdmin = useCallback(() => {
    return hasRole('ADMIN');
  }, [hasRole]);

  /**
   * Check if user is technician
   */
  const isTechnician = useCallback(() => {
    return hasRole('TECHNICIAN');
  }, [hasRole]);

  /**
   * Check if user is manager
   */
  const isManager = useCallback(() => {
    return hasRole('MANAGER');
  }, [hasRole]);

  const value = {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    hasRole,
    isAdmin,
    isTechnician,
    isManager,
    refreshUser: fetchCurrentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 * Use this in components to access auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

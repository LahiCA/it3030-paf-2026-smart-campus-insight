import axiosInstance from '../utils/axios-instance';
import { saveToken, saveUser, clearAuth, getToken } from './storage';

/**
 * Authentication Service
 * 
 * Handles all authentication operations:
 * - Google login
 * - Token refresh
 * - Logout
 */

/**
 * Login with Google ID token
 * Sends the Google token to backend for verification
 * 
 * @param {string} googleToken - Token from Google Sign-In
 * @returns {Promise<object>} User data with JWT token
 */
export const loginWithGoogle = async (googleToken) => {
  try {
    const response = await axiosInstance.post('/auth/google', {
      googleToken
    });

    if (response.data.success && response.data.token) {
      // Save token and user data
      saveToken(response.data.token);
      saveUser({
        id: response.data.userId,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role,
        firstLogin: response.data.firstLogin
      });

      return {
        success: true,
        user: response.data,
        firstLogin: response.data.firstLogin,
        message: 'Login successful'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Login failed'
      };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed. Please try again.'
    };
  }
};

/**
 * Logout user
 * Clears stored token and user data
 */
export const logout = () => {
  clearAuth();
  return {
    success: true,
    message: 'Logged out successfully'
  };
};

/**
 * Complete profile after first login — select role (STUDENT or STAFF)
 *
 * @param {string} role - The selected role
 * @returns {Promise<object>} Updated user data with new JWT
 */
export const completeProfile = async (role) => {
  try {
    const response = await axiosInstance.post('/auth/complete-profile', { role });

    if (response.data.success && response.data.token) {
      // Update stored token and user data with new role
      saveToken(response.data.token);
      saveUser({
        id: response.data.userId,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role,
        firstLogin: false
      });

      return {
        success: true,
        user: response.data,
        message: 'Profile completed successfully'
      };
    }

    return {
      success: false,
      message: response.data.message || 'Failed to complete profile'
    };
  } catch (error) {
    console.error('Complete profile error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to complete profile'
    };
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/users/me');
    
    if (response.status === 200) {
      return {
        success: true,
        user: response.data
      };
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user data'
    };
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Get stored token
 */
export const getAuthToken = () => {
  return getToken();
};

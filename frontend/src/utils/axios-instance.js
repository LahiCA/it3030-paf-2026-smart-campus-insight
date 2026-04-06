import axios from 'axios';
import { API_BASE_URL, TOKEN_KEY, HTTP_STATUS } from './constants';
import { isTokenExpired, getTokenExpiryTime } from './jwt';

/**
 * Axios Instance with JWT Interceptor
 * 
 * Automatically adds JWT token to all requests
 * Handles token expiration and 401 responses
 */

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Request Interceptor
 * Adds JWT token to every request's Authorization header
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from storage
    const token = localStorage.getItem(TOKEN_KEY);
    
    // If token exists and is valid, add it to headers
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Log token expiry info (dev only)
      const expirySeconds = getTokenExpiryTime(token);
      if (expirySeconds > 0 && expirySeconds < 300) {
        console.warn(`Token expiring in ${expirySeconds} seconds`);
      }
    } else if (token && isTokenExpired(token)) {
      // Token is expired, remove it
      localStorage.removeItem(TOKEN_KEY);
      // Redirect to login - handled in response interceptor
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles errors, especially 401 Unauthorized
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Success response
    return response;
  },
  (error) => {
    // Handle different error codes
    if (error.response) {
      switch (error.response.status) {
        case HTTP_STATUS.UNAUTHORIZED:
          // 401 Unauthorized - token invalid/expired
          console.warn('Unauthorized - clearing token and redirecting to login');
          localStorage.removeItem(TOKEN_KEY);
          // Redirect to login page (handled in AuthContext)
          window.dispatchEvent(new Event('auth:logout'));
          break;
          
        case HTTP_STATUS.FORBIDDEN:
          // 403 Forbidden - user doesn't have permission
          console.warn('Forbidden - user does not have permission');
          break;
          
        case HTTP_STATUS.NOT_FOUND:
          // 404 Not Found
          console.warn('Resource not found');
          break;
          
        case HTTP_STATUS.SERVER_ERROR:
          // 500+ Server Error
          console.error('Server error:', error.response.data);
          break;
          
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('No response from server:', error.request);
    } else {
      // Error occurred during request setup
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

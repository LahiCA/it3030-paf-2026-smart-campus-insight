import jwtDecode from 'jwt-decode';
import { TOKEN_KEY } from './constants';

/**
 * JWT Utility Functions
 * 
 * Provides functions to decode, validate, and manage JWT tokens
 */

/**
 * Decode JWT token to extract claims
 * Returns null if token is invalid
 * 
 * @param {string} token - The JWT token
 * @returns {object|null} Decoded token payload or null
 */
export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * 
 * @param {string} token - The JWT token
 * @returns {boolean} True if expired, false if valid
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    // exp is in seconds, current time in milliseconds
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

/**
 * Check if token is valid (exists and not expired)
 * 
 * @param {string} token - The JWT token
 * @returns {boolean} True if valid
 */
export const isTokenValid = (token) => {
  if (!token) return false;
  return !isTokenExpired(token);
};

/**
 * Extract user ID from token
 * 
 * @param {string} token - The JWT token
 * @returns {number|null} User ID or null
 */
export const getUserIdFromToken = (token) => {
  const decoded = decodeToken(token);
  return decoded ? decoded.userId : null;
};

/**
 * Extract email from token
 * 
 * @param {string} token - The JWT token
 * @returns {string|null} User email or null
 */
export const getEmailFromToken = (token) => {
  const decoded = decodeToken(token);
  return decoded ? decoded.sub : null; // 'sub' is the subject (username/email)
};

/**
 * Extract role from token
 * 
 * @param {string} token - The JWT token
 * @returns {string|null} User role or null
 */
export const getRoleFromToken = (token) => {
  const decoded = decodeToken(token);
  return decoded ? decoded.role : null;
};

/**
 * Get time until token expires (in seconds)
 * 
 * @param {string} token - The JWT token
 * @returns {number} Seconds until expiry; 0 if already expired; -1 if invalid
 */
export const getTokenExpiryTime = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return -1;
  }
  const expirySeconds = decoded.exp - Math.floor(Date.now() / 1000);
  return Math.max(0, expirySeconds);
};

/**
 * Check if token will expire soon (within next hour)
 * 
 * @param {string} token - The JWT token
 * @param {number} secondsThreshold - Warn if expiring within this many seconds (default: 3600)
 * @returns {boolean} True if expiring soon
 */
export const isTokenExpiringsoon = (token, secondsThreshold = 3600) => {
  const expiryTime = getTokenExpiryTime(token);
  return expiryTime > 0 && expiryTime < secondsThreshold;
};

/**
 * Refresh token by checking with backend
 * This would be called periodically to get a new token
 * For now, we use the standard 24-hour JWT expiry
 * 
 * In production, you might implement:
 * - Refresh token endpoint
 * - Automatic token renewal
 * - Sliding session windows
 */
export const refreshToken = async (apiClient) => {
  // This is a placeholder - implement based on your backend
  // Most Simple approach: JWT expires after 24 hours, user logs in again
  // Advanced: implement refresh endpoint
  console.log('Token refresh not yet implemented');
  return null;
};

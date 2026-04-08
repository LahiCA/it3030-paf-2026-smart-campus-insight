/**
 * Application Constants
 * 
 * Centralized configuration for frontend
 * Change these values in one place affects entire app
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Token & Storage Keys
export const TOKEN_KEY = 'smartcampus_jwt_token';
export const USER_KEY = 'smartcampus_user';
export const REFRESH_TOKEN_KEY = 'smartcampus_refresh_token';

// User Roles
export const ROLES = {
  ADMIN: 'ADMIN',
  LECTURER: 'LECTURER',
  TECHNICIAN: 'TECHNICIAN'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  BOOKING_APPROVED: 'BOOKING_APPROVED',
  BOOKING_REJECTED: 'BOOKING_REJECTED',
  TICKET_CREATED: 'TICKET_CREATED',
  TICKET_UPDATED: 'TICKET_UPDATED',
  COMMENT_ADDED: 'COMMENT_ADDED',
  BOOKING_COMMENT: 'BOOKING_COMMENT',
  GENERAL: 'GENERAL'
};

// Notification Polling Interval (milliseconds)
export const NOTIFICATION_POLL_INTERVAL = 30000; // 30 seconds

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Your session has expired. Please login again.',
  UNAUTHORIZED: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'An error occurred on the server. Please try again.',
  NETWORK_ERROR: 'Network connection error. Please check your internet.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  USER_NOT_FOUND: 'User not found.'
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  ROLE_SELECTION: '/select-role',
  DASHBOARD: '/dashboard',
  LECTURER_DASHBOARD: '/lecturer-dashboard',
  TECHNICIAN_DASHBOARD: '/technician-dashboard',
  ADMIN_DASHBOARD: '/admin-dashboard',
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN_PANEL: '/admin',
  RESOURCES: '/resources',
  BOOKINGS: '/bookings',
  TICKETS: '/tickets'
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

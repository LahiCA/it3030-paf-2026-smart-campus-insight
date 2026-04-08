import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

/**
 * GoogleLoginButton Component
 * 
 * Wrapper around @react-oauth/google GoogleLogin component
 * Automatically logs in user and redirects to dashboard on success
 * 
 * Props:
 * - onSuccess: (optional) callback after successful login
 * - onError: (optional) callback on login error
 * - text: (optional) button text variant (signin, signup, signin_with, signin_with, etc)
 * - size: (optional) button size (large, medium, small)
 * 
 * Example:
 * <GoogleLoginButton 
 *   onSuccess={() => console.log('Logged in!')} 
 *   text="signin_with" 
 *   size="large" 
 * />
 */

const GoogleLoginButton = ({ onSuccess, onError, text = 'signin_with', size = 'large' }) => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle successful Google login
   * @param {Object} credentialResponse - Google credential response object
   * @param {string} credentialResponse.credential - JWT token from Google
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse.credential;

      // Send token to backend
      const result = await login(googleToken);

      if (result.success) {
        // Call optional callback
        if (onSuccess) {
          onSuccess(result.user);
        }

        // Redirect based on firstLogin or role
        let destination;
        if (result.firstLogin) {
          destination = ROUTES.ROLE_SELECTION;
        } else {
          const role = result.user?.role;
          if (role === 'ADMIN') {
            destination = ROUTES.ADMIN_DASHBOARD;
          } else if (role === 'LECTURER') {
            destination = ROUTES.LECTURER_DASHBOARD;
          } else if (role === 'TECHNICIAN') {
            destination = ROUTES.TECHNICIAN_DASHBOARD;
          } else {
            destination = ROUTES.DASHBOARD;
          }
        }

        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 500);
      } else {
        // Handle login failure
        const errorMsg = result.message || 'Login failed. Please try again.';
        console.error('Login error:', errorMsg);

        if (onError) {
          onError(errorMsg);
        }

        // You can also show a toast/alert here
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Google login error:', error);
      const errorMsg = 'An error occurred while logging in. Please try again.';

      if (onError) {
        onError(errorMsg);
      }

      alert(errorMsg);
    }
  };

  /**
   * Handle Google login failure
   */
  const handleGoogleError = () => {
    const errorMsg = 'Failed to initialize Google login. Please check your connection.';
    console.error('Google login initialization error');

    if (onError) {
      onError(errorMsg);
    }

    alert(errorMsg);
  };

  return (
    <div className="google-login-button-container">
      {!isAuthenticated && (
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          text={text}
          size={size}
          logo_alignment="center"
          width={size === 'large' ? '300' : '250'}
        />
      )}
    </div>
  );
};

export default GoogleLoginButton;

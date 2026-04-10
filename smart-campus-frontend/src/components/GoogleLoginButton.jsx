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
    <div className="google-login-button-container relative w-full flex justify-center">
      {true && (
        <>
          {/* Custom green button overlay */}
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <div className="flex w-full max-w-[300px] items-center justify-center gap-3 rounded-xl bg-[#166534] px-6 py-3 text-sm font-semibold text-white shadow-lg">
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              Sign in with Google
            </div>
          </div>
          {/* Actual Google button (invisible but clickable) */}
          <div className="opacity-0" style={{ minHeight: '44px' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              text={text}
              size={size}
              logo_alignment="center"
              width="300"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default GoogleLoginButton;

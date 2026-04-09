package com.smartcampus.backend.util;

/**
 * AppConstants
 * 
 * Centralized location for application-wide constants.
 * This keeps magic strings out of code and makes them easy to change.
 */
public class AppConstants {

    /**
     * JWT token expiry time in milliseconds (24 hours)
     * After this time, the token is invalid and user must login again
     */
    public static final long JWT_EXPIRY_MS = 86400000; // 24 hours

    /**
     * Google's public JWK (JSON Web Key) Set URL
     * This is where Google publishes the keys used to sign their ID tokens.
     * We use this to verify that tokens are legitimate Google tokens.
     */
    public static final String GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";

    public static final String DEFAULT_ROLE = "LECTURER";

    public static final String ADMIN_ROLE = "ADMIN";

    public static final String TECHNICIAN_ROLE = "TECHNICIAN";

    public static final String LECTURER_ROLE = "LECTURER";
}

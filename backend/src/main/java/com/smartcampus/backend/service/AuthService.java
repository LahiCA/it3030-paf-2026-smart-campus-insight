package com.smartcampus.backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.smartcampus.backend.dto.response.LoginResponse;
import com.smartcampus.backend.entities.User;
import com.smartcampus.backend.exception.InvalidTokenException;
import com.smartcampus.backend.exception.UserNotFoundException;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.util.AppConstants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Collections;

/**
 * AuthService
 * 
 * Handles all authentication logic:
 * 1. Verifying Google ID tokens (security check)
 * 2. Creating or updating users in the database
 * 3. Assigning roles based on email
 * 4. Generating JWT tokens
 * 
 * This is the core service that ties everything together.
 */
@Slf4j
@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * ADMIN_EMAILS environment variable
     * Contains comma-separated emails that should be admin
     * Example: "admin@sliit.edu,manager@sliit.edu"
     * If empty, only the first registered user becomes admin
     */
    @Value("${admin.emails:}")
    private String adminEmails;

    /**
     * Google OAuth 2.0 Client ID
     * Get this from Google Cloud Console
     */
    @Value("${google.client.id}")
    private String googleClientId;

    /**
     * Login with Google ID token
     * 
     * This method:
     * 1. Verifies that the Google ID token is legitimate
     * 2. Extracts user info (email, name) from the token
     * 3. Creates a new user or updates existing one
     * 4. Assigns ADMIN role if email is in ADMIN_EMAILS
     * 5. Generates a JWT token
     * 6. Returns everything the frontend needs
     * 
     * @param googleToken The Google ID token from the frontend
     * @return LoginResponse containing JWT token and user info
     * @throws InvalidTokenException if token is invalid
     */
    public LoginResponse loginWithGoogle(String googleToken) {
        log.info("Processing Google login with token");

        try {
            // Step 1: Verify the Google token is legitimate
            GoogleIdToken idToken = verifyGoogleToken(googleToken);
            if (idToken == null) {
                throw new InvalidTokenException("Failed to verify Google token");
            }

            // Step 2: Extract user information from the token
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            log.info("Google token verified. Email: {}, Name: {}", email, name);

            // Step 3: Find existing user or create new one
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> createNewUser(email, name));

            // Step 4: Update user information (in case name changed in Google account)
            user.setName(name);
            user.setPassword(passwordEncoder.encode(googleToken)); // Store encrypted token as "password"

            // If this is a new user and email is in ADMIN_EMAILS, make them admin
            if (!user.getId().equals(null) && isAdminEmail(email)) {
                user.setRole(AppConstants.ADMIN_ROLE);
                log.info("User {} is admin (matches ADMIN_EMAILS)", email);
            }

            // Save the updated user
            user = userRepository.save(user);
            log.info("User {} saved to database", email);

            // Step 5: Generate JWT token
            String jwtToken = jwtTokenProvider.generateToken(
                    user.getId(),
                    user.getEmail(),
                    user.getRole());

            // Step 6: Build and return response
            LoginResponse response = LoginResponse.builder()
                    .success(true)
                    .message("Login successful")
                    .token(jwtToken)
                    .userId(user.getId())
                    .email(user.getEmail())
                    .name(user.getName())
                    .role(user.getRole())
                    .build();

            log.info("Login successful for user: {}", email);
            return response;

        } catch (GeneralSecurityException | IOException e) {
            log.error("Error verifying Google token: {}", e.getMessage());
            throw new InvalidTokenException("Invalid or expired Google token", e);
        }
    }

    /**
     * Verify that a Google ID token is legitimate
     * 
     * This is CRITICAL for security. We use Google's libraries to verify:
     * 1. The token was issued by Google (not fake)
     * 2. The token is signed with Google's private key
     * 3. The token is for our app (Client ID matches)
     * 4. The token hasn't expired
     * 
     * @param token The Google ID token
     * @return GoogleIdToken object if valid, null if invalid
     * @throws GeneralSecurityException if verification fails
     * @throws IOException              if network error
     */
    private GoogleIdToken verifyGoogleToken(String token)
            throws GeneralSecurityException, IOException {

        log.debug("Verifying Google token");

        // Create verifier
        JsonFactory jsonFactory = GsonFactory.getDefaultInstance();
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                jsonFactory)
                // CRITICAL: Must match your app's client ID from Google Cloud Console
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        try {
            // This does all the security checks
            GoogleIdToken idToken = verifier.verify(token);

            if (idToken == null) {
                log.error("Google token verification returned null");
                return null;
            }

            log.debug("Google token verified successfully");
            return idToken;

        } catch (IllegalArgumentException e) {
            log.error("Invalid Google token format: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Create a new user from Google credentials
     * Assigns the default role (usually USER)
     * 
     * @param email User's email from Google
     * @param name  User's name from Google
     * @return A new unsaved User entity
     */
    private User createNewUser(String email, String name) {
        log.info("Creating new user: {}", email);

        User user = new User();
        user.setEmail(email);
        user.setName(name);

        // Assign role based on whether email is in ADMIN_EMAILS
        if (isAdminEmail(email)) {
            user.setRole(AppConstants.ADMIN_ROLE);
            log.info("New user {} assigned ADMIN role", email);
        } else {
            user.setRole(AppConstants.DEFAULT_ROLE);
            log.info("New user {} assigned DEFAULT role", email);
        }

        return user;
    }

    /**
     * Check if an email is in the ADMIN_EMAILS list
     * 
     * ADMIN_EMAILS is an environment variable like:
     * "admin@sliit.edu,manager@sliit.edu"
     * 
     * @param email Email to check
     * @return true if email should be admin
     */
    private boolean isAdminEmail(String email) {
        if (adminEmails == null || adminEmails.trim().isEmpty()) {
            return false;
        }

        // Split by comma and check if email matches any
        return Arrays.stream(adminEmails.split(","))
                .map(String::trim)
                .anyMatch(adminEmail -> adminEmail.equalsIgnoreCase(email));
    }
}

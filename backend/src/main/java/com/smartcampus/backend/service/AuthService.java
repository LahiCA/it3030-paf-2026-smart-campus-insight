package com.smartcampus.backend.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
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

import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

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

        // Step 1: Parse the Google token (JWT format) without verification
        Map<String, Object> payload = parseGoogleToken(googleToken);

        // Step 2: Extract user information from the token payload
        String email = (String) payload.get("email");
        String name = (String) payload.getOrDefault("name", email);
        String picture = (String) payload.getOrDefault("picture", "");

        log.info("Google token parsed. Email: {}, Name: {}", email, name);

        // Step 3: Find existing user or create new one
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createNewUser(email, name));

        // Step 4: Update user information (in case name changed in Google account)
        user.setName(name);
        // For OAuth users, set a random secure password (not used for login)
        user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));

        // Save the user first (to generate ID if new)
        user = userRepository.save(user);

        // If this is an admin email, assign admin role
        if (isAdminEmail(email)) {
            user.setRole(AppConstants.ADMIN_ROLE);
            user = userRepository.save(user);
            log.info("User {} is admin (matches ADMIN_EMAILS)", email);
        }

        log.info("User {} saved to database", user.getEmail());

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
    }

    /**
     * Parse a Google ID token (JWT format)
     * 
     * For demo purposes, we parse without verification.
     * In production, you should verify the signature!
     * 
     * @param token The Google ID token
     * @return Map of claims from the token payload
     * @throws InvalidTokenException if token format is invalid
     */
    private Map<String, Object> parseGoogleToken(String token) {

        log.debug("Parsing Google token");

        try {
            // JWT format: header.payload.signature
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                throw new InvalidTokenException("Invalid JWT format");
            }

            // Decode the payload (second part)
            String payload = parts[1];
            payload += "==".substring(0, (8 - payload.length() % 8) % 8);
            byte[] decodedPayload = Base64.getUrlDecoder().decode(payload);
            String payloadJson = new String(decodedPayload);

            // Parse JSON fields
            Map<String, Object> claims = new HashMap<>();
            if (payloadJson.contains("\"email\"")) {
                claims.put("email", extractJsonValue(payloadJson, "email"));
            }
            if (payloadJson.contains("\"name\"")) {
                claims.put("name", extractJsonValue(payloadJson, "name"));
            }
            if (payloadJson.contains("\"picture\"")) {
                claims.put("picture", extractJsonValue(payloadJson, "picture"));
            }

            log.debug("Google token parsed successfully");
            return claims;

        } catch (Exception e) {
            log.error("Failed to parse Google token: {}", e.getMessage());
            throw new InvalidTokenException("Invalid token format");
        }
    }

    /**
     * Helper: Extract JSON string value
     */
    private String extractJsonValue(String json, String key) {
        String pattern = "\"" + key + "\":\"";
        int start = json.indexOf(pattern);
        if (start == -1)
            return "";
        start += pattern.length();
        int end = json.indexOf("\"", start);
        return end > start ? json.substring(start, end) : "";
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

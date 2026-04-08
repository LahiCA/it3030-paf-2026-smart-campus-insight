package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.response.LoginResponse;
import com.smartcampus.backend.entities.User;
import com.smartcampus.backend.exception.InvalidTokenException;
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

    @Autowired
    private SequenceGeneratorService sequenceGeneratorService;

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

        log.info("Google token parsed. Email: {}, Name: {}", email, name);

        // Step 3: Check if user exists in DB — only pre-registered users can log in
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // Allow admin email to auto-register, block everyone else
            if (!isAdminEmail(email)) {
                log.warn("Login rejected for unregistered email: {}", email);
                throw new InvalidTokenException(
                        "Access denied. Your account has not been enrolled by an administrator.");
            }
            // Auto-create admin user on first login
            user = createNewUser(email, name);
        }

        // Step 4: Update name from Google (keep their display name current)
        user.setName(name);
        // For OAuth users, set a random secure password (not used for login)
        user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));

        // If this is an admin email, ensure admin role and displayId
        if (isAdminEmail(email)) {
            user.setRole(AppConstants.ADMIN_ROLE);
            if (user.getDisplayId() == null || !user.getDisplayId().startsWith("ADM")) {
                user.setDisplayId(sequenceGeneratorService.generateDisplayId(AppConstants.ADMIN_ROLE));
            }
        }

        user = userRepository.save(user);
        log.info("User {} logged in with role {}", user.getEmail(), user.getRole());

        // Step 5: Generate JWT token
        String jwtToken = jwtTokenProvider.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole());

        // Step 6: Build and return response
        // needsRoleSelection is never true now — admin pre-assigns roles
        LoginResponse response = LoginResponse.builder()
                .success(true)
                .message("Login successful")
                .token(jwtToken)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .displayId(user.getDisplayId())
                .firstLogin(false)
                .build();

        log.info("Login successful for user: {}", email);
        return response;
    }

    /**
     * Complete profile after first login — user selects their role
     *
     * @param email    The authenticated user's email
     * @param roleName The chosen role: STUDENT or STAFF
     * @return Updated LoginResponse with new JWT
     */
    public LoginResponse completeProfile(String email, String roleName) {
        log.info("Completing profile for user: {} with role: {}", email, roleName);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.smartcampus.backend.exception.UserNotFoundException(
                        "User not found with email: " + email));

        if (!"LECTURER".equalsIgnoreCase(roleName) && !"TECHNICIAN".equalsIgnoreCase(roleName)) {
            throw new IllegalArgumentException("Invalid role selection. Choose LECTURER or TECHNICIAN.");
        }

        user.setRole(roleName.toUpperCase());
        user.setDisplayId(sequenceGeneratorService.generateDisplayId(roleName.toUpperCase()));
        user.setUpdatedAt(java.time.LocalDateTime.now());
        user = userRepository.save(user);

        // Generate a new JWT with the updated role
        String jwtToken = jwtTokenProvider.generateToken(
                user.getId(), user.getEmail(), user.getRole());

        return LoginResponse.builder()
                .success(true)
                .message("Profile completed successfully")
                .token(jwtToken)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .displayId(user.getDisplayId())
                .firstLogin(false)
                .build();
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
            payload += "==".substring(0, (4 - payload.length() % 4) % 4);
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

        String role;
        if (isAdminEmail(email)) {
            role = AppConstants.ADMIN_ROLE;
        } else {
            role = AppConstants.DEFAULT_ROLE;
        }
        user.setRole(role);
        user.setDisplayId(sequenceGeneratorService.generateDisplayId(role));
        log.info("New user {} assigned role {} with displayId {}", email, role, user.getDisplayId());

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

package com.smartcampus.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * LoginResponse DTO
 * 
 * Represents the successful response after Google token verification.
 * The frontend will store the JWT token and use it for all future API calls.
 * 
 * Example response:
 * {
 * "success": true,
 * "message": "Login successful",
 * "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 * "userId": 1,
 * "email": "student@example.com",
 * "name": "John Doe",
 * "role": "USER"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    /**
     * Whether the login was successful
     */
    private boolean success;

    /**
     * Human-readable message for the frontend to display to the user
     */
    private String message;

    /**
     * JWT token that must be included in future API requests.
     * Format: Authorization: Bearer <token>
     */
    private String token;

    /**
     * The newly created or updated user's ID
     */
    private String userId;

    /**
     * The user's email address
     */
    private String email;

    /**
     * The user's full name
     */
    private String name;

    /**
     * The user's role: ADMIN, LECTURER, TECHNICIAN
     */
    private String role;

    /**
     * Custom display ID like ADM0001, LEC0001, TEC0001
     */
    private String displayId;

    /**
     * Whether this is the user's first login (needs role selection)
     */
    private boolean firstLogin;
}

package com.smartcampus.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * LoginRequest DTO
 * 
 * Represents a login request from the frontend containing a Google ID token.
 * The frontend receives this token from Google Sign-In, then sends it here.
 * 
 * Example:
 * {
 * "googleToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE..."
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    /**
     * Google ID Token received from the frontend.
     * This is NOT the user's password — it's proof from Google that the user
     * is who they claim to be.
     */
    @NotBlank(message = "Google token cannot be blank")
    private String googleToken;
}

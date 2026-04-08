package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.request.LoginRequest;
import com.smartcampus.backend.dto.response.LoginResponse;
import com.smartcampus.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController
 * 
 * REST controller for authentication endpoints.
 * 
 * Endpoints:
 * - POST /api/auth/google — Login with Google ID token
 * 
 * All auth endpoints are PUBLIC (don't require JWT)
 * because we need to authenticate before we have a JWT.
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Google OAuth 2.0 Login Endpoint
     * 
     * HTTP Method: POST
     * Path: /api/auth/google
     * Authentication: PUBLIC (not required)
     * 
     * Request Body:
     * {
     * "googleToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE..."
     * }
     * 
     * Response (Success - 200 OK):
     * {
     * "success": true,
     * "message": "Login successful",
     * "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     * "userId": 1,
     * "email": "student@example.com",
     * "name": "John Doe",
     * "role": "USER"
     * }
     * 
     * Response (Failure - 401 Unauthorized):
     * {
     * "success": false,
     * "message": "Authentication failed: Invalid or expired Google token",
     * "statusCode": 401,
     * "timestamp": "2026-04-06T10:30:00"
     * }
     * 
     * How it works:
     * 1. Frontend gets Google ID token from Google Sign-In widget
     * 2. Frontend sends token to this endpoint
     * 3. We verify the token with Google
     * 4. We create/update user in database
     * 5. We generate our own JWT
     * 6. Frontend stores JWT and uses it for all future requests
     * 
     * @param loginRequest DTO containing the Google token
     * @return LoginResponse with JWT and user info
     */
    @PostMapping("/google")
    public ResponseEntity<LoginResponse> loginWithGoogle(
            @Valid @RequestBody LoginRequest loginRequest) {

        log.info("Received Google login request");

        // Call service to verify token and create/update user
        LoginResponse response = authService.loginWithGoogle(loginRequest.getGoogleToken());

        // Return 200 OK with the response
        return ResponseEntity.ok(response);
    }
}

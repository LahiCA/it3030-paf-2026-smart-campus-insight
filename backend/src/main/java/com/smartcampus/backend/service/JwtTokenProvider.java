package com.smartcampus.backend.service;

import com.smartcampus.backend.util.AppConstants;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JwtTokenProvider
 * 
 * Handles creating and validating JWT (JSON Web Token) tokens.
 * 
 * JWT Structure:
 * ┌─────────────┬──────────────┬───────────┐
 * │ Header │ Payload │ Signature │
 * ├─────────────┼──────────────┼───────────┤
 * │ - Algorithm │ - userId │ Signed │
 * │ - Token Type│ - email │ with │
 * │ │ - role │ JWT_SECRET│
 * │ │ - exp (when │ │
 * │ │ it expires)│ │
 * └─────────────┴──────────────┴───────────┘
 * 
 * When you call generateToken(), this creates a digitally signed token.
 * When you call validateToken(), this verifies the signature hasn't been
 * tampered with.
 */
@Slf4j
@Service
public class JwtTokenProvider {

    /**
     * JWT_SECRET is injected from application.yaml
     * It's used to sign and verify tokens.
     * SECURITY: Keep this secret! If exposed, anyone can forge tokens.
     */
    @Value("${jwt.secret:your-secret-key-change-in-production}")
    private String jwtSecret;

    /**
     * Get the secret key used for signing
     * We use HMAC SHA-256 algorithm which requires a key of at least 32 bytes
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Generate a JWT token for an authenticated user
     * 
     * @param userId The user's ID in the database
     * @param email  The user's email address
     * @param role   The user's role (USER, ADMIN, TECHNICIAN, MANAGER)
     * @return A signed JWT token string
     */
    public String generateToken(String userId, String email, String role) {
        log.debug("Generating JWT token for user: {} with role: {}", email, role);

        // Create claims (payload) of the token
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("role", role);

        // Current time and expiry time
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + AppConstants.JWT_EXPIRY_MS);

        // Build the token
        String token = Jwts.builder()
                // Set the payload claims
                .addClaims(claims)
                // Who issued this token (it's us)
                .setIssuer("smartcampus-auth")
                // Who this token is for
                .setSubject(email)
                // When it was issued
                .setIssuedAt(now)
                // When it expires (IMPORTANT: after this, token is invalid)
                .setExpiration(expiryDate)
                // Sign it with our secret key
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                // Compact it into a string (the actual token you send)
                .compact();

        log.debug("JWT token generated successfully for user: {}", email);
        return token;
    }

    /**
     * Extract user ID from a JWT token (without validating signature)
     * Use this if you trust the token already
     * 
     * @param token The JWT token
     * @return The user ID
     */
    public String extractUserId(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.get("userId", String.class);
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Error extracting userId from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract email from a JWT token
     * 
     * @param token The JWT token
     * @return The user's email
     */
    public String extractEmail(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getSubject();
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Error extracting email from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extract role from a JWT token
     * 
     * @param token The JWT token
     * @return The user's role (USER, ADMIN, TECHNICIAN, MANAGER)
     */
    public String extractRole(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.get("role", String.class);
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Error extracting role from token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Validate a JWT token by checking its signature and expiry
     * 
     * IMPORTANT: This validates that:
     * 1. The signature is correct (token wasn't tampered with)
     * 2. The token hasn't expired yet
     * 3. The token can be parsed
     * 
     * @param token The JWT token to validate
     * @return true if valid, false if invalid
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);

            log.debug("JWT token validated successfully");
            return true;
        } catch (SecurityException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
            return false;
        } catch (ExpiredJwtException e) {
            log.error("Expired JWT token: {}", e.getMessage());
            return false;
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
            return false;
        } catch (JwtException e) {
            log.error("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }
}

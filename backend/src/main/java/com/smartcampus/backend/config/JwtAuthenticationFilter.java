package com.smartcampus.backend.config;

import com.smartcampus.backend.service.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;

/**
 * JwtAuthenticationFilter
 * 
 * Spring filter that runs on EVERY HTTP request.
 * It extracts the JWT token from the Authorization header and validates it.
 * 
 * Request Flow:
 * 1. Frontend sends: "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
 * 2. This filter extracts the token from the header
 * 3. JwtTokenProvider validates the token's signature
 * 4. If valid, we create an Authentication object and add it to SecurityContext
 * 5. Spring then allows the request to proceed
 * 6. The controller can access the authenticated user
 * via @AuthenticationPrincipal
 * 
 * Authorization Header Format:
 * Authorization: Bearer <token>
 * 
 * Example:
 * Authorization: Bearer
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoic3R1ZGVudEBlYW1wbGUuY29tIn0.xyz...
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    /**
     * Filter logic — runs for every HTTP request
     * 
     * @param request     HTTP request
     * @param response    HTTP response
     * @param filterChain Chain of filters
     * @throws ServletException if servlet error
     * @throws IOException      if IO error
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // Step 1: Extract JWT from Authorization header
            String jwt = extractJwtFromRequest(request);

            if (jwt != null) {
                // Step 2: Validate the JWT
                if (jwtTokenProvider.validateToken(jwt)) {
                    // Step 3: Extract user info from the token
                    String email = jwtTokenProvider.extractEmail(jwt);
                    String role = jwtTokenProvider.extractRole(jwt);

                    log.debug("JWT validated for user: {} with role: {}", email, role);

                    // Step 4: Create authorities from the role
                    Collection<GrantedAuthority> authorities = new ArrayList<>();
                    if (role != null) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
                    }

                    // Step 5: Create an Authentication object
                    // The principal is the email (username)
                    // The credentials are null (we don't store passwords)
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            email, // Principal (username)
                            null, // Credentials (we don't use password auth)
                            authorities // Authorities (roles)
                    );

                    // Step 6: Set the authentication in the security context
                    // This tells Spring "this user is authenticated"
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    log.debug("Authentication set for user: {}", email);
                } else {
                    log.warn("Invalid JWT token");
                }
            }
        } catch (Exception e) {
            log.error("Error during JWT authentication: {}", e.getMessage());
        }

        // Continue the filter chain
        // Even if authentication failed, we let the request proceed.
        // Spring will reject it if the endpoint requires authentication.
        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT token from Authorization header
     * 
     * Expected format: "Authorization: Bearer <token>"
     * 
     * @param request HTTP request
     * @return JWT token, or null if not present or malformed
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            // Remove "Bearer " prefix (7 characters)
            return bearerToken.substring(7);
        }

        return null;
    }
}

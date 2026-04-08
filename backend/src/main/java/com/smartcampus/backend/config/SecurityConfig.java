package com.smartcampus.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * SecurityConfig
 * 
 * Spring Security configuration for JWT authentication.
 * 
 * This class tells Spring:
 * 1. Which endpoints are PUBLIC (no JWT required)
 * 2. Which endpoints require JWT authentication
 * 3. How to validate JWT tokens
 * 4. How to handle CORS for frontend communication
 * 5. How to encode passwords (using BCrypt)
 * 
 * Security Flow:
 * 1. Frontend includes JWT in header: "Authorization: Bearer <token>"
 * 2. JwtAuthenticationFilter intercepts the request
 * 3. Filter extracts JWT and validates it
 * 4. If valid, Spring creates an Authentication object
 * 5. Request proceeds; if invalid, request is rejected with 401
 */
@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true) // Enables @PreAuthorize annotations
public class SecurityConfig {

        @Autowired
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        /**
         * Password encoder bean
         * 
         * BCrypt is industry-standard password hashing algorithm.
         * Benefits:
         * - One-way hashing (can't reverse to get original password)
         * - Salted (same password produces different hashes)
         * - Adaptive (gets slower over time to prevent brute-force)
         * 
         * @return BCryptPasswordEncoder bean
         */
        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        /**
         * HTTP security configuration
         * 
         * This is the main security configuration that tells Spring:
         * - Which endpoints are public vs secured
         * - How to handle authentication failures
         * - How to manage sessions
         * - Which filters to use
         * 
         * @param http HttpSecurity object to configure
         * @return SecurityFilterChain
         * @throws Exception if configuration fails
         */
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                log.info("Configuring Spring Security filter chain");

                http
                                // Disable CSRF because we use JWT (stateless)
                                .csrf(csrf -> csrf.disable())

                                // Enable CORS for frontend communication
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // Use stateless session management (JWT doesn't need sessions)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                                // Configure endpoint access
                                .authorizeHttpRequests(auth -> auth
                                                // PUBLIC endpoints - no JWT required
                                                .requestMatchers(
                                                                "/api/auth/**", // All auth endpoints
                                                                "/swagger-ui.html", // Swagger UI
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**",
                                                                "/" // Root path
                                                ).permitAll()

                                                // All other endpoints require authentication
                                                .anyRequest().authenticated())

                                // Return 401 (not 403) for unauthenticated requests
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint((request, response, authException) -> {
                                                        response.setContentType("application/json");
                                                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                                                        response.getWriter().write(
                                                                        "{\"success\":false,\"message\":\"Unauthorized - please log in again\",\"statusCode\":401}");
                                                }))

                                // Add JWT filter before the default UsernamePasswordAuthenticationFilter
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        /**
         * CORS (Cross-Origin Resource Sharing) configuration
         * 
         * Allows the React frontend to make requests to this Java backend.
         * Without CORS, browsers block cross-origin requests for security.
         * 
         * @return CorsConfigurationSource
         */
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();

                // Allow requests from localhost (for development)
                config.setAllowedOrigins(Arrays.asList(
                                "http://localhost:3000",
                                "http://localhost:3001",
                                "http://localhost:3002",
                                "http://localhost:3003",
                                "http://localhost:3004",
                                "http://localhost:3005",
                                "http://localhost:3006",
                                "http://localhost:3007",
                                "http://localhost:3008",
                                "http://localhost:8080"));

                // Allow these HTTP methods
                config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

                // Allow these headers
                config.setAllowedHeaders(Arrays.asList(
                                "Content-Type",
                                "Authorization",
                                "X-Requested-With"));

                // Allow credentials (cookies if needed)
                config.setAllowCredentials(true);

                // Cache CORS preflight for 1 hour
                config.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);

                return source;
        }
}

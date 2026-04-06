package com.smartcampus.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * UserDTO (Data Transfer Object)
 * 
 * Used when returning user information to the frontend.
 * Contains only non-sensitive information (no passwords).
 * 
 * Benefits:
 * - Security: Can't accidentally expose password fields
 * - Flexibility: Can change User entity without breaking API
 * - Clean API: Only returns what frontend needs
 * 
 * Example response:
 * {
 *   "id": 1,
 *   "email": "student@example.com",
 *   "name": "John Doe",
 *   "role": "USER",
 *   "createdAt": "2026-04-06T10:00:00",
 *   "updatedAt": "2026-04-06T11:30:00"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    
    /**
     * User's unique ID
     */
    private Long id;
    
    /**
     * User's email address
     */
    private String email;
    
    /**
     * User's full name
     */
    private String name;
    
    /**
     * User's role: USER, ADMIN, TECHNICIAN, MANAGER
     */
    private String role;
    
    /**
     * When the account was created
     */
    private LocalDateTime createdAt;
    
    /**
     * When the account was last updated
     */
    private LocalDateTime updatedAt;
}

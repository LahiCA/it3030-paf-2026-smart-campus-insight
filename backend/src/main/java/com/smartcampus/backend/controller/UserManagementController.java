package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.request.UpdateRoleRequest;
import com.smartcampus.backend.dto.response.UserDTO;
import com.smartcampus.backend.service.UserManagementService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * UserManagementController
 * 
 * REST controller for user and role management operations.
 * Demonstrates @PreAuthorize for role-based access control.
 * 
 * Endpoints:
 * - GET /api/users/me — Get current authenticated user's info
 * - GET /api/users/{id} — Get user by ID (ADMIN only)
 * - GET /api/users — Get all users (ADMIN only)
 * - GET /api/users/role/{role} — Get users by role (ADMIN only)
 * - PUT /api/users/{id}/role — Update user role (ADMIN only)
 * - DELETE /api/users/{id} — Delete user (ADMIN only)
 * 
 * @PreAuthorize Annotations:
 * - "isAuthenticated()" — Any logged-in user
 * - "hasRole('ADMIN')" — Only ADMIN users
 * - "hasAnyRole('ADMIN', 'MANAGER')" — ADMIN or MANAGER
 * - "#id == authentication.principal.id" — Only their own data
 */
@Slf4j
@RestController
@RequestMapping("/api/users")
public class UserManagementController {
    
    @Autowired
    private UserManagementService userManagementService;
    
    /**
     * Get current authenticated user's information
     * 
     * HTTP Method: GET
     * Path: /api/users/me
     * Authentication: Required (any authenticated user)
     * Parameters: None
     * 
     * Response (200 OK):
     * {
     *   "id": 1,
     *   "email": "student@example.com",
     *   "name": "John Doe",
     *   "role": "USER",
     *   "createdAt": "2026-04-06T10:00:00",
     *   "updatedAt": "2026-04-06T11:30:00"
     * }
     * 
     * Why isAuthenticated():
     * Any user who has a valid JWT token can call this.
     * They get their own information.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        log.info("Fetching current user info for: {}", authentication.getName());
        
        // authentication.getName() returns the email (set in JwtAuthenticationFilter)
        UserDTO userDTO = userManagementService.getUserByEmail(authentication.getName());
        
        return ResponseEntity.ok(userDTO);
    }
    
    /**
     * Get a specific user's information by ID
     * 
     * HTTP Method: GET
     * Path: /api/users/{id}
     * Authentication: ADMIN only
     * Parameters: id (path parameter)
     * 
     * Response (200 OK): Same as /me endpoint
     * Response (404 Not Found): User doesn't exist
     * Response (403 Forbidden): Not an ADMIN
     * 
     * Why hasRole('ADMIN'):
     * Only administrators can look up other users' information.
     * This is a security restriction to prevent users from
     * spying on each other's details.
     * 
     * @param id The user ID to fetch
     * @return UserDTO if found
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        log.info("Admin fetching user with ID: {}", id);
        
        UserDTO userDTO = userManagementService.getUserById(id);
        
        return ResponseEntity.ok(userDTO);
    }
    
    /**
     * Get all users in the system
     * 
     * HTTP Method: GET
     * Path: /api/users
     * Authentication: ADMIN only
     * Parameters: None
     * 
     * Response (200 OK):
     * [
     *   {
     *     "id": 1,
     *     "email": "student1@example.com",
     *     "name": "John Doe",
     *     "role": "USER"
     *   },
     *   {
     *     "id": 2,
     *     "email": "admin@example.com",
     *     "name": "Admin User",
     *     "role": "ADMIN"
     *   }
     * ]
     * 
     * Use case: Admin dashboard to display user roster
     * 
     * @return List of all users
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        log.info("Admin fetching all users");
        
        List<UserDTO> users = userManagementService.getAllUsers();
        
        return ResponseEntity.ok(users);
    }
    
    /**
     * Get all users with a specific role
     * 
     * HTTP Method: GET
     * Path: /api/users/role/{role}
     * Authentication: ADMIN only
     * Parameters: role (path parameter — USER, ADMIN, TECHNICIAN, MANAGER)
     * 
     * Response (200 OK): List of users with that role
     * Response (403 Forbidden): Not an ADMIN
     * 
     * Use case: Filter users by role for admin panels
     * Example: /api/users/role/TECHNICIAN → Get all technicians
     * 
     * @param role The role to filter by
     * @return List of users with that role
     */
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String role) {
        log.info("Admin fetching users with role: {}", role);
        
        List<UserDTO> users = userManagementService.getUsersByRole(role.toUpperCase());
        
        return ResponseEntity.ok(users);
    }
    
    /**
     * Update a user's role
     * 
     * HTTP Method: PUT
     * Path: /api/users/{id}/role
     * Authentication: ADMIN only
     * Status Codes:
     * - 200 OK — Role updated successfully
     * - 400 Bad Request — Invalid role or validation error
     * - 404 Not Found — User doesn't exist
     * - 403 Forbidden — Not an ADMIN
     * 
     * Request Body:
     * {
     *   "userId": 5,
     *   "newRole": "TECHNICIAN"
     * }
     * 
     * Response (200 OK):
     * {
     *   "id": 5,
     *   "email": "john@example.com",
     *   "name": "John Doe",
     *   "role": "TECHNICIAN",    ← Changed from USER
     *   "updatedAt": "2026-04-06T12:00:00"
     * }
     * 
     * Why PUT vs PATCH:
     * PUT = full resource update (we're updating the whole role)
     * PATCH = partial update (would need more context)
     * We use PUT because we're updating a single fixed field
     * 
     * @param id The user ID (from path)
     * @param request The new role (from body)
     * @return Updated UserDTO
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        
        log.info("Admin updating role for user ID {} to: {}", id, request.getNewRole());
        
        UserDTO updatedUser = userManagementService.updateUserRole(id, request.getNewRole());
        
        // Return 200 OK (not 201 Created) because we updated an existing resource
        return ResponseEntity.ok(updatedUser);
    }
    
    /**
     * Delete a user from the system
     * 
     * HTTP Method: DELETE
     * Path: /api/users/{id}
     * Authentication: ADMIN only
     * Status Codes:
     * - 204 No Content — User deleted successfully
     * - 404 Not Found — User doesn't exist
     * - 403 Forbidden — Not an ADMIN
     * - 400 Bad Request — Can't delete yourself
     * 
     * Response Body: Empty (204 No Content)
     * 
     * Why 204 No Content:
     * After deletion, there's no user to return.
     * Standard REST: DELETE returns 204 (no response body)
     * vs POST returns 201 (with response body)
     * 
     * Danger: This is permanent! Use with caution.
     * Consider soft-delete in production (mark as inactive, don't actually delete)
     * 
     * @param id The user ID to delete
     * @return 204 No Content
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.warn("Admin deleting user with ID: {}", id);
        
        userManagementService.deleteUser(id);
        
        // Return 204 No Content
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Example endpoint: Demonstrate role-based access control
     * This is for learning purposes
     * 
     * Different responses based on role:
     * - ADMIN sees full dashboard
     * - TECHNICIAN sees technician dashboard
     * - USER sees limited view
     * 
     * This shows the flexibility of @PreAuthorize
     */
    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> getDashboard(Authentication authentication) {
        log.info("User accessing dashboard: {}", authentication.getName());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Welcome " + authentication.getName());
        response.put("role", authentication.getAuthorities().toString());
        
        return ResponseEntity.ok(response);
    }
}

package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.response.UserDTO;
import com.smartcampus.backend.entities.User;
import com.smartcampus.backend.enums.UserRole;
import com.smartcampus.backend.exception.UserNotFoundException;
import com.smartcampus.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * UserManagementService
 * 
 * Handles user and role management operations.
 * This service:
 * - Fetches user information
 * - Updates user roles
 * - Converts User entities to UserDTOs
 * - Validates role changes
 * 
 * All operations that modify user data should go through this service,
 * not directly in controllers. This keeps business logic centralized.
 */
@Slf4j
@Service
public class UserManagementService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get a user by ID and return as DTO
     * 
     * @param userId The user ID
     * @return UserDTO containing user information
     * @throws UserNotFoundException if user doesn't exist
     */
    public UserDTO getUserById(String userId) {
        log.debug("Fetching user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new UserNotFoundException("User not found with ID: " + userId);
                });

        return convertToDTO(user);
    }

    /**
     * Get a user by email and return as DTO
     * 
     * @param email The user's email
     * @return UserDTO containing user information
     * @throws UserNotFoundException if user doesn't exist
     */
    public UserDTO getUserByEmail(String email) {
        log.debug("Fetching user with email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new UserNotFoundException("User not found with email: " + email);
                });

        return convertToDTO(user);
    }

    /**
     * Get all users (ADMIN only)
     * Useful for admin dashboard to see all users
     * 
     * @return List of all users as DTOs
     */
    public List<UserDTO> getAllUsers() {
        log.info("Fetching all users");

        return userRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all users with a specific role
     * 
     * @param role The role to filter by (e.g., "ADMIN", "TECHNICIAN")
     * @return List of users with that role
     */
    public List<UserDTO> getUsersByRole(String role) {
        log.info("Fetching users with role: {}", role);

        return userRepository.findByRole(role)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update a user's role (ADMIN only)
     * 
     * This method:
     * 1. Finds the user
     * 2. Validates the new role is valid
     * 3. Updates the role
     * 4. Saves to database
     * 5. Returns updated user info
     * 
     * @param userId  The user whose role should be updated
     * @param newRole The new role (USER, ADMIN, TECHNICIAN, MANAGER)
     * @return Updated UserDTO
     * @throws UserNotFoundException    if user doesn't exist
     * @throws IllegalArgumentException if role is invalid
     */
    public UserDTO updateUserRole(String userId, String newRole) {
        log.info("Updating role for user ID {} to role: {}", userId, newRole);

        // Step 1: Find the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new UserNotFoundException("User not found with ID: " + userId);
                });

        // Step 2: Validate the role using the enum
        try {
            UserRole role = UserRole.fromString(newRole);
            newRole = role.name(); // Get the canonical name (e.g., "ADMIN", not "admin")
        } catch (IllegalArgumentException e) {
            log.error("Invalid role: {}", newRole);
            throw new IllegalArgumentException(
                    "Invalid role: " + newRole + ". Must be one of: USER, ADMIN, TECHNICIAN, MANAGER");
        }

        // Step 3: Update the role
        user.setRole(newRole);
        user.setUpdatedAt(LocalDateTime.now());

        // Step 4: Save to database
        user = userRepository.save(user);
        log.info("Role updated successfully for user ID: {}", userId);

        // Step 5: Return as DTO
        return convertToDTO(user);
    }

    /**
     * Delete a user (ADMIN only - use with caution!)
     * 
     * @param userId The user to delete
     * @throws UserNotFoundException if user doesn't exist
     */
    public void deleteUser(String userId) {
        log.warn("Deleting user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new UserNotFoundException("User not found with ID: " + userId);
                });

        // Prevent deleting yourself
        if (user.getId().equals(userId)) {
            log.warn("Attempted to delete own account");
            throw new IllegalArgumentException("Cannot delete your own account");
        }

        userRepository.delete(user);
        log.info("User deleted successfully: {}", userId);
    }

    /**
     * Convert a User entity to a UserDTO
     * 
     * This method copies data from the entity to the DTO.
     * It deliberately excludes sensitive fields like password.
     * 
     * @param user The User entity
     * @return UserDTO
     */
    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

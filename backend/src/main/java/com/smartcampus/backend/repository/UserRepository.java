package com.smartcampus.backend.repository;

import com.smartcampus.backend.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository
 * 
 * Spring Data JPA repository for User entity.
 * Automatically provides CRUD operations:
 * - save() — insert or update
 * - findById() — get by ID
 * - delete() — delete a user
 * - findAll() — get all users
 * 
 * We add custom query methods for specific needs.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by email address
     * Used during login to check if user already exists
     * 
     * @param email The email address
     * @return Optional<User> containing the user if found
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Find all users with a specific role
     * More efficient than loading all users and filtering in Java
     * 
     * @param role The role to search for (e.g., "ADMIN", "TECHNICIAN")
     * @return List of users with that role
     */
    List<User> findByRole(String role);
}

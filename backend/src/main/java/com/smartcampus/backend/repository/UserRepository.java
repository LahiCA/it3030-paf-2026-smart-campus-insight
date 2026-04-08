package com.smartcampus.backend.repository;

import com.smartcampus.backend.entities.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository
 * 
 * Spring Data MongoDB repository for User document.
 * Automatically provides CRUD operations.
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    List<User> findByRole(String role);
}

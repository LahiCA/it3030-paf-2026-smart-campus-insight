package com.smartcampus.backend.repository;

import com.smartcampus.backend.entities.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    Optional<User> findByDisplayId(String displayId);

    List<User> findByRole(String role);

    boolean existsByEmail(String email);

    boolean existsByDisplayId(String displayId);
}

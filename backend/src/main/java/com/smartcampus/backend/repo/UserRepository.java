

package com.smartcampus.backend.repo;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.backend.model.User;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
   
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);

}

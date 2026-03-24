package com.smartcampus.backend.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartcampus.backend.entities.User;

public interface UserRepository extends JpaRepository<User, Long> {
   
    boolean existsByEmail(String email);

}

package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.request.CreateUserRequest;
import com.smartcampus.backend.dto.response.UserDTO;
import com.smartcampus.backend.entities.User;
import com.smartcampus.backend.enums.UserRole;
import com.smartcampus.backend.exception.UserNotFoundException;
import com.smartcampus.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class UserManagementService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SequenceGeneratorService sequenceGeneratorService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserDTO createUser(CreateUserRequest request) {
        log.info("Creating new user: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        UserRole role = UserRole.fromString(request.getRole());

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(role.name());
        user.setDisplayId(sequenceGeneratorService.generateDisplayId(role.name()));
        user.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        user = userRepository.save(user);
        log.info("User created with displayId: {}", user.getDisplayId());

        return convertToDTO(user);
    }

    public UserDTO getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        return convertToDTO(user);
    }

    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        return convertToDTO(user);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getUsersByRole(String role) {
        return userRepository.findByRole(role)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO updateUser(String userId, CreateUserRequest request) {
        log.info("Updating user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        // Check email uniqueness if email changed
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        UserRole newRole = UserRole.fromString(request.getRole());

        // If role changed, generate new displayId
        if (!user.getRole().equals(newRole.name())) {
            user.setDisplayId(sequenceGeneratorService.generateDisplayId(newRole.name()));
            user.setRole(newRole.name());
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setUpdatedAt(LocalDateTime.now());

        user = userRepository.save(user);
        log.info("User updated: {}", user.getDisplayId());

        return convertToDTO(user);
    }

    public UserDTO updateUserRole(String userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        UserRole role = UserRole.fromString(newRole);

        if (!user.getRole().equals(role.name())) {
            user.setDisplayId(sequenceGeneratorService.generateDisplayId(role.name()));
        }

        user.setRole(role.name());
        user.setUpdatedAt(LocalDateTime.now());
        user = userRepository.save(user);

        return convertToDTO(user);
    }

    public void deleteUser(String userId) {
        log.warn("Deleting user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

        userRepository.delete(user);
        log.info("User deleted: {}", userId);
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .displayId(user.getDisplayId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

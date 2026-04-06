package com.smartcampus.backend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.smartcampus.backend.entities.User;
import com.smartcampus.backend.repo.UserRepository;
import com.smartcampus.backend.enums.AuthProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User registerUserLocal(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setAuthProvide(AuthProvider.LOCAL);
        return userRepository.save(user);
    }

    public User loginUserLocal(User user) {
        User existingUser = userRepository.findByEmail(user.getEmail())
                .orElse(null);
        if (existingUser != null) {
            if (!passwordEncoder.matches(user.getPassword(), existingUser.getPassword())) {
                throw new RuntimeException("Invalid credentials");
            }
            return existingUser;
        }
        throw new RuntimeException("User not found with email: " + user.getEmail());
    }

    public User loginRegisterByGoogleOAuth2(OAuth2AuthenticationToken oAuth2AuthenticationToken) {
        
        OAuth2User oAuth2User = oAuth2AuthenticationToken.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        log.info("Google OAuth2 login attempt for email: {}", email);
        log.info("Google OAuth2 user : {}", name);

        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setName(name);
            user.setAuthProvide(AuthProvider.GOOGLE);
            return userRepository.save(user);
        }
        return user;
    }
}
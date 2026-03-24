package com.smartcampus.backend.controller;

import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.net.URI;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import com.smartcampus.backend.entities.User;
import com.smartcampus.backend.service.UserService;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        return ResponseEntity.ok(userService.registerUserLocal(user));
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User user) {
        return ResponseEntity.ok(userService.loginUserLocal(user));
    }
    
    @GetMapping("/login/google")
    public ResponseEntity<String> loginGoogleOAuth(HttpServletResponse response) throws IOException {
        response.sendRedirect("/oauth2/authorization/google");
        return ResponseEntity.ok("Redirecting...");
    }

    @GetMapping("/loginSuccess")
    public ResponseEntity<String> handleGoogleLoginSuccess(OAuth2AuthenticationToken oAuth2AuthenticationToken) throws IOException {
       User user = userService.loginRegisterByGoogleOAuth2(oAuth2AuthenticationToken);
       return ResponseEntity.status(HttpStatus.NOT_FOUND).location(URI.create("http://localhost:3000/home")).build();
    }
    
}

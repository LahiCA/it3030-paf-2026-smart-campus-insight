package com.smartcampus.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DemoController {

    @GetMapping("/")
    public String home() {
        return "Welcome! Please login.";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "You are logged in!";
    }
}
package com.smartcampus.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api")
public class Demo {

    @GetMapping("/public")
    public String publicApi() {
        return "This is a public API endpoint accessible to everyone.";
    }

    @GetMapping("/private")
    public String privateApi() {
        return "Authenticated";
    }
    

}

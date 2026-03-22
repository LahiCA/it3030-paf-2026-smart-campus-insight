package com.smartcampus.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api")
public class DemoController {

    @GetMapping("/public")
    public String publicApi() {
        return "This is a public API.";
    }

    @GetMapping("/private")
    public String privateApi() {
        return "Authenticated" ;
}


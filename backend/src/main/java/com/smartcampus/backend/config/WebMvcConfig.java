// src/main/java/com/smartcampus/backend/config/WebMvcConfig.java
package com.smartcampus.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static files from uploads directory
        String uploadPath = Paths.get(System.getProperty("user.dir"), "uploads").toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:///" + uploadPath + "/")
                .setCachePeriod(3600);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Allow CORS for image requests from frontend
        registry.addMapping("/uploads/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173")
                .allowedMethods("GET", "HEAD", "OPTIONS")
                .allowCredentials(false);
    }
}
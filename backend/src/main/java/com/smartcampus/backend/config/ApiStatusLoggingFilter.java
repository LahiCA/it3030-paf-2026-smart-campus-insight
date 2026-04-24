package com.smartcampus.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class ApiStatusLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        if (request.getRequestURI().startsWith("/api/")) {
            log.info("API request received: {} {}", request.getMethod(), request.getRequestURI());
        }

        filterChain.doFilter(request, response);

        if (!request.getRequestURI().startsWith("/api/")) {
            return;
        }

        int status = response.getStatus();
        String statusLabel = switch (status) {
            case 200 -> "200 OK";
            case 201 -> "201 Created";
            case 204 -> "204 No Content";
            case 400 -> "400 Bad Request";
            case 401 -> "401 Unauthorized";
            case 403 -> "403 Forbidden";
            case 404 -> "404 Not Found";
            case 409 -> "409 Conflict";
            case 500 -> "500 Internal Server Error";
            default -> status + "";
        };

        if (status >= 500) {
            log.error("API response: {} {} -> {}", request.getMethod(), request.getRequestURI(), statusLabel);
        } else if (status >= 400) {
            log.warn("API response: {} {} -> {}", request.getMethod(), request.getRequestURI(), statusLabel);
        } else {
            log.info("API response: {} {} -> {}", request.getMethod(), request.getRequestURI(), statusLabel);
        }
    }
}

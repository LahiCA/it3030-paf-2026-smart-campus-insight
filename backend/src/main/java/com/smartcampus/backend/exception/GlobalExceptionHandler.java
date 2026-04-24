/*Catches thrown exceptions across controllers and converts them into clean HTTP responses */
package com.smartcampus.backend.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.smartcampus.backend.bookingworkflow.exception.BookingConflictException;
import com.smartcampus.backend.bookingworkflow.exception.InvalidBookingException;
import com.smartcampus.backend.bookingworkflow.exception.ResourceNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        LOGGER.warn("HTTP 400 Bad Request: {} {} - Validation failed", request.getMethod(), request.getRequestURI());

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> body = errorBody("Validation failed", HttpStatus.BAD_REQUEST);
        body.put("errors", fieldErrors);

        return ResponseEntity.badRequest().body(body);
    }

    // Runtime exceptions
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex, HttpServletRequest request) {
        LOGGER.error("HTTP 400 Bad Request: {} {} - {}", request.getMethod(), request.getRequestURI(), ex.getMessage(),
                ex);
        return ResponseEntity
                .badRequest()
                .body(errorBody(ex.getMessage(), HttpStatus.BAD_REQUEST));
    }

    // Booking conflict
    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(BookingConflictException ex, HttpServletRequest request) {
        LOGGER.warn("HTTP 409 Conflict: {} {} - {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(errorBody(ex.getMessage(), HttpStatus.CONFLICT));
    }

    // Booking invalid workflow/inputs
    @ExceptionHandler(InvalidBookingException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidBooking(InvalidBookingException ex,
            HttpServletRequest request) {
        LOGGER.warn("HTTP 400 Bad Request: {} {} - {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity
                .badRequest()
                .body(errorBody(ex.getMessage(), HttpStatus.BAD_REQUEST));
    }

    // Not found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex,
            HttpServletRequest request) {
        LOGGER.warn("HTTP 404 Not Found: {} {} - {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(errorBody(ex.getMessage(), HttpStatus.NOT_FOUND));
    }

    // Illegal arguments
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegal(IllegalArgumentException ex,
            HttpServletRequest request) {
        LOGGER.warn("HTTP 400 Bad Request: {} {} - {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity
                .badRequest()
                .body(errorBody(ex.getMessage(), HttpStatus.BAD_REQUEST));
    }

    // Generic errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex, HttpServletRequest request) {
        LOGGER.error("HTTP 500 Internal Server Error: {} {} - {}", request.getMethod(), request.getRequestURI(),
                ex.getMessage(), ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorBody(
                        ex.getMessage() == null ? "Something went wrong" : ex.getMessage(),
                        HttpStatus.INTERNAL_SERVER_ERROR
                ));
    }

    // Reusable response builder
    private Map<String, Object> errorBody(String message, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("message", message);
        return body;
    }
}
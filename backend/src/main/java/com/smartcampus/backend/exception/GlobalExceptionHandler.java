package com.smartcampus.backend.exception;

import com.smartcampus.backend.dto.response.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * GlobalExceptionHandler
 * 
 * Using @ControllerAdvice, this class intercepts all exceptions thrown in
 * controllers
 * and formats them into consistent ErrorResponse objects.
 * 
 * Benefits:
 * - No try-catch blocks cluttering controller code
 * - Consistent error format for the frontend
 * - Centralized error handling logic
 * - Easy to add new exception types
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

        /**
         * Handle InvalidTokenException
         * Returns 401 Unauthorized if the Google token is invalid
         */
        @ExceptionHandler(InvalidTokenException.class)
        public ResponseEntity<ErrorResponse> handleInvalidTokenException(
                        InvalidTokenException ex,
                        WebRequest request) {

                ErrorResponse error = ErrorResponse.builder()
                                .success(false)
                                .message("Authentication failed: " + ex.getMessage())
                                .statusCode(HttpStatus.UNAUTHORIZED.value())
                                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                                .build();

                return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }

        /**
         * Handle UserNotFoundException
         * Returns 404 Not Found if the user doesn't exist
         */
        @ExceptionHandler(UserNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleUserNotFoundException(
                        UserNotFoundException ex,
                        WebRequest request) {

                ErrorResponse error = ErrorResponse.builder()
                                .success(false)
                                .message(ex.getMessage())
                                .statusCode(HttpStatus.NOT_FOUND.value())
                                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                                .build();

                return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }

        /**
         * Handle validation errors from @Valid
         * Returns 400 Bad Request if request body validation fails
         */
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidationException(
                        MethodArgumentNotValidException ex,
                        WebRequest request) {

                org.springframework.validation.FieldError fieldError = ex.getBindingResult().getFieldError();
                String message = fieldError != null ? fieldError.getDefaultMessage() : "Validation failed";

                ErrorResponse error = ErrorResponse.builder()
                                .success(false)
                                .message("Validation error: " + message)
                                .statusCode(HttpStatus.BAD_REQUEST.value())
                                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                                .build();

                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        /**
         * Handle IllegalArgumentException
         * Returns 400 Bad Request for invalid arguments
         */
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
                        IllegalArgumentException ex,
                        WebRequest request) {

                ErrorResponse error = ErrorResponse.builder()
                                .success(false)
                                .message(ex.getMessage())
                                .statusCode(HttpStatus.BAD_REQUEST.value())
                                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                                .build();

                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        /**
         * Handle all other exceptions
         * Returns 500 Internal Server Error for unexpected exceptions
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGlobalException(
                        Exception ex,
                        WebRequest request) {

                ErrorResponse error = ErrorResponse.builder()
                                .success(false)
                                .message("An unexpected error occurred: " + ex.getMessage())
                                .statusCode(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                                .build();

                return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
}

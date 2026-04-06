package com.smartcampus.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ErrorResponse DTO
 * 
 * Represents error responses from the API.
 * Used by GlobalExceptionHandler to send consistent error messages.
 * 
 * Example error response:
 * {
 * "success": false,
 * "message": "Invalid Google token provided",
 * "statusCode": 401,
 * "timestamp": "2026-04-06T10:30:00"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {

    /**
     * Always false for error responses
     */
    private boolean success;

    /**
     * Error message to display to the user
     */
    private String message;

    /**
     * HTTP status code (401, 400, 404, 500, etc.)
     */
    private int statusCode;

    /**
     * ISO 8601 timestamp of when the error occurred
     */
    private String timestamp;
}

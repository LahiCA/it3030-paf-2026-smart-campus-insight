package com.smartcampus.backend.exception;

/**
 * InvalidTokenException
 * 
 * Thrown when a Google ID token cannot be verified or is invalid.
 * This could happen if:
 * - Token is expired
 * - Token is tampered with
 * - Token was not issued by Google
 * - Token signature is wrong
 */
public class InvalidTokenException extends RuntimeException {

    /**
     * Constructor with custom message
     */
    public InvalidTokenException(String message) {
        super(message);
    }

    /**
     * Constructor with message and cause
     */
    public InvalidTokenException(String message, Throwable cause) {
        super(message, cause);
    }
}

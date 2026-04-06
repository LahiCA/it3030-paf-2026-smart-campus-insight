package com.smartcampus.backend.exception;

/**
 * UserNotFoundException
 * 
 * Thrown when a user is not found in the database.
 * This could happen if:
 * - A user ID doesn't exist
 * - An email doesn't match any user
 */
public class UserNotFoundException extends RuntimeException {

    /**
     * Constructor with custom message
     */
    public UserNotFoundException(String message) {
        super(message);
    }

    /**
     * Constructor with message and cause
     */
    public UserNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}

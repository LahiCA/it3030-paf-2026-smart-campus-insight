package com.smartcampus.backend.bookingworkflow.exception;

/*Used when a booking id does not exist (for get/approve/reject/cancel/delete operations */

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
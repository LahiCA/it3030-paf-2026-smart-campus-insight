package com.smartcampus.backend.bookingworkflow.exception;

/*cancelling a booking in a disallowed status */

public class InvalidBookingException extends RuntimeException {
    public InvalidBookingException(String message) {
        super(message);
    }
}

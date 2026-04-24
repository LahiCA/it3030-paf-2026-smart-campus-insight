package com.smartcampus.backend.bookingworkflow.exception;

/*Used when a requested or approved booking overlaps with an existing approved/check-in slot.
 */

public class BookingConflictException extends RuntimeException {
    public BookingConflictException(String message) {
        super(message);
    }
}
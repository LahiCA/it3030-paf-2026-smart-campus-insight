package com.smartcampus.backend.bookingworkflow.controller;

import com.smartcampus.backend.bookingworkflow.dto.BookingCancelDto;
import com.smartcampus.backend.bookingworkflow.dto.BookingDecisionDto;
import com.smartcampus.backend.bookingworkflow.dto.BookingRequestDto;
import com.smartcampus.backend.bookingworkflow.model.Booking;
import com.smartcampus.backend.bookingworkflow.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**

 * REST API Controller for handling all facility and asset booking workflows.
 * Implements RESTful best practices with GET, POST, PATCH, and DELETE methods.
 */
@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    /**
     * Creates a new booking request.
     * @param dto Data Transfer Object containing booking details (date, times, purpose).
     * @return The created Booking object.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Booking create(@Valid @RequestBody BookingRequestDto dto) {
        return service.createBooking(dto);
    }

    /**
     * Retrieves all bookings across the entire system.
     * Primarily used by the Admin Booking Management dashboard.
     */
    @GetMapping
    public List<Booking> getAll() {
        return service.getAllBookings();
    }

    /**
     * Retrieves a specific booking by its MongoDB ID.
     */
    @GetMapping("/{id}")
    public Booking getById(@PathVariable String id) {
        return service.getBookingById(id);
    }

    /**
     * Retrieves all bookings made by a specific user.
     * Used by the "My Bookings" page on the frontend.
     */
    @GetMapping("/user/{userId}")
    public List<Booking> getMyBookings(@PathVariable String userId) {
        return service.getMyBookings(userId);
    }

    /**
     * Partially updates a booking's status to APPROVED.
     */
    @PatchMapping("/{id}/approve")
    public Booking approve(@PathVariable String id) {
        return service.approveBooking(id);
    }

    /**
     * Partially updates a booking's status to REJECTED.
     * @param dto Contains the admin's mandatory rejection reason.
     */
    @PatchMapping("/{id}/reject")
    public Booking reject(@PathVariable String id,
                          @Valid @RequestBody BookingDecisionDto dto) {
        return service.rejectBooking(id, dto.getReason());
    }

    /**
     * Partially updates a booking's status to CANCELLED.
     */
    @PatchMapping("/{id}/cancel")
    public Booking cancel(@PathVariable String id,
                          @RequestBody BookingCancelDto dto) {
        return service.cancelBooking(id, dto);
    }

    /**
     * Partially updates a booking's status to CHECKED_IN.
     */
    @PatchMapping("/{id}/checkin")
    public Booking checkIn(@PathVariable String id) {
        return service.checkInBooking(id);
    }

    /**
     * Completely removes a booking from the database and sends a notification.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id, @RequestParam(required = false) String reason) {
        service.deleteBooking(id, reason);
    }
}
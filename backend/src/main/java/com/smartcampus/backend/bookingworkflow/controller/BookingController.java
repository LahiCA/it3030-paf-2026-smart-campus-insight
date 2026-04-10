package com.smartcampus.backend.bookingworkflow.controller;

import com.smartcampus.backend.bookingworkflow.dto.BookingCancelDto;
import com.smartcampus.backend.bookingworkflow.dto.BookingDecisionDto;
import com.smartcampus.backend.bookingworkflow.dto.BookingRequestDto;
import com.smartcampus.backend.bookingworkflow.model.Booking;
import com.smartcampus.backend.bookingworkflow.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @PostMapping
    public Booking create(@Valid @RequestBody BookingRequestDto dto) {
        return service.createBooking(dto);
    }

    @GetMapping
    public List<Booking> getAll() {
        return service.getAllBookings();
    }

    @GetMapping("/{id}")
    public Booking getById(@PathVariable String id) {
        return service.getBookingById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getMyBookings(@PathVariable String userId) {
        return service.getMyBookings(userId);
    }

    @PatchMapping("/{id}/approve")
    public Booking approve(@PathVariable String id) {
        return service.approveBooking(id);
    }

    @PatchMapping("/{id}/reject")
    public Booking reject(@PathVariable String id,
                          @Valid @RequestBody BookingDecisionDto dto) {
        return service.rejectBooking(id, dto.getReason());
    }

    @PatchMapping("/{id}/cancel")
    public Booking cancel(@PathVariable String id,
                          @RequestBody BookingCancelDto dto) {
        return service.cancelBooking(id, dto);
    }

    @PatchMapping("/{id}/checkin")
    public Booking checkIn(@PathVariable String id) {
        return service.checkInBooking(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id, @RequestParam(required = false) String reason) {
        service.deleteBooking(id, reason);
    }
}
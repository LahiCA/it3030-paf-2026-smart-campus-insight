package com.smartcampus.backend.bookingworkflow.service;

import com.smartcampus.backend.bookingworkflow.dto.BookingCancelDto;
import com.smartcampus.backend.bookingworkflow.dto.BookingRequestDto;
import com.smartcampus.backend.bookingworkflow.exception.BookingConflictException;
import com.smartcampus.backend.bookingworkflow.exception.InvalidBookingException;
import com.smartcampus.backend.bookingworkflow.exception.ResourceNotFoundException;
import com.smartcampus.backend.bookingworkflow.model.Booking;
import com.smartcampus.backend.bookingworkflow.model.BookingStatus;
import com.smartcampus.backend.bookingworkflow.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository repository;

    public BookingService(BookingRepository repository) {
        this.repository = repository;
    }

    public Booking createBooking(BookingRequestDto dto) {
        LocalDate date = LocalDate.parse(dto.getBookingDate());
        LocalTime start = LocalTime.parse(dto.getStartTime());
        LocalTime end = LocalTime.parse(dto.getEndTime());

        if (!end.isAfter(start)) {
            throw new InvalidBookingException("End time must be after start time");
        }

        List<Booking> existingBookings =
                repository.findByResourceNameAndBookingDate(dto.getResourceName(), date);

        boolean hasConflict = existingBookings.stream()
                .filter(b -> b.getStatus() != BookingStatus.REJECTED && b.getStatus() != BookingStatus.CANCELLED)
                .anyMatch(b -> start.isBefore(b.getEndTime()) && end.isAfter(b.getStartTime()));

        if (hasConflict) {
            throw new BookingConflictException("Selected time slot is already booked for this resource");
        }

        Booking booking = Booking.builder()
                .userId(dto.getUserId())
                .resourceName(dto.getResourceName())
                .resourceType(dto.getResourceType())
                .bookingDate(date)
                .startTime(start)
                .endTime(end)
                .purpose(dto.getPurpose())
                .expectedAttendees(dto.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return repository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return repository.findAll();
    }

    public List<Booking> getMyBookings(String userId) {
        return repository.findByUserId(userId);
    }

    public Booking getBookingById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    public Booking approveBooking(String id) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException("Only pending bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(LocalDateTime.now());

        return repository.save(booking);
    }

    public Booking rejectBooking(String id, String reason) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());

        return repository.save(booking);
    }

    public Booking cancelBooking(String id, BookingCancelDto dto) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new InvalidBookingException("Only approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelReason(dto.getReason());
        booking.setUpdatedAt(LocalDateTime.now());

        return repository.save(booking);
    }
}
package com.smartcampus.backend.bookingworkflow.service;

import com.smartcampus.backend.bookingworkflow.dto.BookingCancelDto;
import com.smartcampus.backend.bookingworkflow.dto.BookingRequestDto;
import com.smartcampus.backend.bookingworkflow.exception.BookingConflictException;
import com.smartcampus.backend.bookingworkflow.exception.InvalidBookingException;
import com.smartcampus.backend.bookingworkflow.exception.ResourceNotFoundException;
import com.smartcampus.backend.bookingworkflow.model.Booking;
import com.smartcampus.backend.bookingworkflow.model.BookingStatus;
import com.smartcampus.backend.bookingworkflow.repository.BookingRepository;
import com.smartcampus.backend.enums.NotificationType;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Module B: Booking Management (Member 2)
 * Core business logic and workflow management for handling resource reservations.
 * Enforces anti-overlapping logic, manages status transitions, and interfaces with the Notification Service.
 */
@Slf4j
@Service
public class BookingService {

    private final BookingRepository repository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public BookingService(BookingRepository repository, NotificationService notificationService,
            UserRepository userRepository) {
        this.repository = repository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    /**
     * Initializes a new booking request.
     * Prevents conflicts for the same resource by evaluating overlapping time ranges against APPROVED or CHECKED_IN bookings.
     */
    public Booking createBooking(BookingRequestDto dto) {
        log.info("Booking create requested: userId={}, resource={}, date={}, time={} - {}",
            dto.getUserId(), dto.getResourceName(), dto.getBookingDate(), dto.getStartTime(), dto.getEndTime());

        LocalDate date = LocalDate.parse(dto.getBookingDate());
        LocalTime start = LocalTime.parse(dto.getStartTime());
        LocalTime end = LocalTime.parse(dto.getEndTime());

        if (!end.isAfter(start)) {
            throw new InvalidBookingException("End time must be after start time");
        }

        // Fetch all bookings for the requested resource and date
        List<Booking> existingBookings = repository.findByResourceNameAndBookingDate(dto.getResourceName(), date);

        // Core Conflict Logic: Check if any existing APPROVED or CHECKED_IN booking overlaps with the requested time.
        // PENDING requests are intentionally ignored to avoid unnecessarily blocking a user up-front.
        boolean hasConflict = existingBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.CHECKED_IN)
                .anyMatch(b -> start.isBefore(b.getEndTime()) && end.isAfter(b.getStartTime()));

        if (hasConflict) {
            throw new BookingConflictException("Selected time slot is already booked for this resource");
        }

        // Default state: PENDING
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

            Booking saved = repository.save(booking);
            log.info("Booking created successfully: bookingId={}, status={}, userId={}",
                saved.getId(), saved.getStatus(), saved.getUserId());
            return saved;
    }

    public List<Booking> getAllBookings() {
        log.debug("Fetching all bookings");
        return repository.findAll();
    }

    public List<Booking> getMyBookings(String userId) {
        log.debug("Fetching bookings for userId={}", userId);
        return repository.findByUserId(userId);
    }

    public Booking getBookingById(String id) {
        log.debug("Fetching booking by id={}", id);
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }

    /**
     * Admin action to approve a booking request. Only PENDING requests can be approved.
     * Fires a notification off to the user who requested the booking.
     */
    public Booking approveBooking(String id) {
        log.info("Booking approval requested: bookingId={}", id);
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException("Only pending bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = repository.save(booking);
        log.info("Booking approved: bookingId={}, status={}", saved.getId(), saved.getStatus());

        try {
            resolveRecipientId(saved.getUserId()).ifPresentOrElse(
                    recipientId -> notificationService.sendNotification(
                            recipientId,
                            "Your booking for \"" + saved.getResourceName() + "\" on " + saved.getBookingDate()
                                    + " (" + saved.getStartTime() + " - " + saved.getEndTime() + ") has been approved.",
                            NotificationType.BOOKING_APPROVED,
                            saved.getId(),
                            "BOOKING"),
                    () -> log.warn("No user found for booking userId '{}' — approval notification skipped",
                            saved.getUserId()));
        } catch (Exception e) {
            log.error("Failed to send booking approved notification for booking {}: {}", saved.getId(), e.getMessage());
        }

        return saved;
    }

    /**
     * Admin action to reject a booking request. Only PENDING requests can be rejected.
     * Requires a rejection reason from the admin and fires an email notification to the user.
     */
    public Booking rejectBooking(String id, String reason) {
        log.info("Booking rejection requested: bookingId={}, reason={}", id, reason);
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = repository.save(booking);
        log.info("Booking rejected: bookingId={}, status={}", saved.getId(), saved.getStatus());

        try {
            String msg = "Your booking for \"" + saved.getResourceName() + "\" on " + saved.getBookingDate()
                    + " has been rejected."
                    + (reason != null && !reason.isBlank() ? " Reason: " + reason : "");
            resolveRecipientId(saved.getUserId()).ifPresentOrElse(
                    recipientId -> notificationService.sendNotification(
                            recipientId,
                            msg,
                            NotificationType.BOOKING_REJECTED,
                            saved.getId(),
                            "BOOKING"),
                    () -> log.warn("No user found for booking userId '{}' — rejection notification skipped",
                            saved.getUserId()));
        } catch (Exception e) {
            log.error("Failed to send booking rejected notification for booking {}: {}", saved.getId(), e.getMessage());
        }

        return saved;
    }

    /**
     * User action to cancel their own approved booking.
     */
    public Booking cancelBooking(String id, BookingCancelDto dto) {
        log.info("Booking cancellation requested: bookingId={}, reason={}", id, dto == null ? null : dto.getReason());
        Booking booking = getBookingById(id);
        // Allow users to cancel either APPROVED or PENDING bookings via the UI.
        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException("Only pending or approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelReason(dto == null ? null : dto.getReason());
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = repository.save(booking);
        log.info("Booking cancelled: bookingId={}, status={}", saved.getId(), saved.getStatus());
        return saved;
    }

    /**
     * Updates an approved booking to indicate the user has successfully checked in to their reservation in real life.
     */
    public Booking checkInBooking(String id) {
        log.info("Booking check-in requested: bookingId={}", id);
        Booking booking = getBookingById(id);

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new InvalidBookingException("Only approved bookings can be checked in");
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setUpdatedAt(LocalDateTime.now());

        Booking saved = repository.save(booking);
        log.info("Booking checked-in: bookingId={}, status={}", saved.getId(), saved.getStatus());
        return saved;
    }

    /**
     * Admin action to completely erase a booking log off the database, sending a final notification to the user if requested.
     */
    public void deleteBooking(String id, String reason) {
        log.info("Booking deletion requested: bookingId={}, reason={}", id, reason);
        Booking booking = getBookingById(id);

        // Try to send notification before deleting
        try {
            String msg = "Your booking for \"" + booking.getResourceName() + "\" on " + booking.getBookingDate()
                    + " has been deleted by an administrator."
                    + (reason != null && !reason.isBlank() ? " Reason: " + reason : "");
            resolveRecipientId(booking.getUserId()).ifPresentOrElse(
                    recipientId -> notificationService.sendNotification(
                            recipientId,
                            msg,
                            NotificationType.BOOKING_REJECTED, 
                            booking.getId(),
                            "BOOKING"),
                    () -> log.warn("No user found for booking userId '{}' — deletion notification skipped",
                            booking.getUserId()));
        } catch (Exception e) {
            log.error("Failed to send booking deleted notification for booking {}: {}", booking.getId(), e.getMessage());
        }

        repository.delete(booking);
        log.info("Booking deleted: bookingId={}", booking.getId());
    }

    /**
     * Resolve a notification recipient's MongoDB _id from whatever was stored as
     * userId on the booking. The booking form stores the user's displayId
     * (e.g. "ADM0001"), so first try an exact _id lookup, then fall back to a
     * displayId lookup.
     */
    private Optional<String> resolveRecipientId(String bookingUserId) {
        if (bookingUserId == null || bookingUserId.isBlank()) {
            return Optional.empty();
        }
        // Try by MongoDB _id first
        if (userRepository.existsById(bookingUserId)) {
            return Optional.of(bookingUserId);
        }
        // Fall back to displayId lookup (booking form stores displayId as userId)
        return userRepository.findByDisplayId(bookingUserId)
                .map(u -> u.getId());
    }
}
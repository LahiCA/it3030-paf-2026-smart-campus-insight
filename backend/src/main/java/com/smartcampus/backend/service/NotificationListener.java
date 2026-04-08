package com.smartcampus.backend.service;

import com.smartcampus.backend.enums.NotificationType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * NotificationListener
 * 
 * This service acts as a bridge/listener for booking and ticket modules.
 * When your teammates' modules (Booking, Ticket) have important events,
 * they call methods in this class to trigger notifications.
 * 
 * This way:
 * - Your notification module doesn't depend on booking/ticket modules
 * - Booking/ticket modules don't directly create notifications
 * - Everything is loosely coupled
 * - Easy to add new notification types without modifying other modules
 * 
 * Example Usage (In BookingService or BookingController):
 * 
 * @Autowired
 *            private NotificationListener notificationListener;
 * 
 *            public void approveBooking(Long bookingId) {
 *            Booking booking = bookingRepository.findById(bookingId).get();
 *            booking.setStatus("APPROVED");
 *            bookingRepository.save(booking);
 * 
 *            // Notify the user
 *            notificationListener.notifyBookingApproved(booking.getUser().getId(),
 *            bookingId);
 *            }
 * 
 *            This keeps booking logic in BookingService and notification logic
 *            in NotificationService.
 */
@Slf4j
@Service
public class NotificationListener {

    @Autowired
    private NotificationService notificationService;

    /**
     * Called by BookingService when a booking is approved
     * Notifies the user that their booking was approved
     * 
     * @param userId    The user whose booking was approved
     * @param bookingId The booking ID (for the frontend to reference)
     */
    public void notifyBookingApproved(String userId, String bookingId) {
        log.info("Sending booking approved notification to user {}", userId);

        notificationService.sendNotification(
                userId,
                "Your facility booking has been approved",
                NotificationType.BOOKING_APPROVED,
                bookingId,
                "BOOKING");
    }

    /**
     * Called by BookingService when a booking is rejected
     * Notifies the user with a reason
     * 
     * @param userId    The user whose booking was rejected
     * @param bookingId The booking ID
     * @param reason    Optional reason for rejection
     */
    public void notifyBookingRejected(String userId, String bookingId, String reason) {
        log.info("Sending booking rejected notification to user {}", userId);

        String message = reason != null && !reason.isEmpty()
                ? "Your booking was rejected: " + reason
                : "Your booking was rejected";

        notificationService.sendNotification(
                userId,
                message,
                NotificationType.BOOKING_REJECTED,
                bookingId,
                "BOOKING");
    }

    /**
     * Called by TicketService when a new ticket is created/assigned
     * Notifies the assigned technician or all admins
     * 
     * @param userId      The user assigned to the ticket
     * @param ticketId    The ticket ID
     * @param ticketTitle The ticket title/subject
     */
    public void notifyTicketCreated(String userId, String ticketId, String ticketTitle) {
        log.info("Sending ticket created notification to user {}", userId);

        String message = "New incident ticket created: " + ticketTitle;

        notificationService.sendNotification(
                userId,
                message,
                NotificationType.TICKET_CREATED,
                ticketId,
                "TICKET");
    }

    /**
     * Called by TicketService when a ticket status changes
     * Notifies the assigned person and watchers
     * 
     * @param userId    The user to notify
     * @param ticketId  The ticket ID
     * @param newStatus The new status (e.g., "IN_PROGRESS", "RESOLVED", "CLOSED")
     */
    public void notifyTicketStatusChanged(String userId, String ticketId, String newStatus) {
        log.info("Sending ticket status changed notification to user {}", userId);

        String message = "Ticket #" + ticketId + " status changed to: " + newStatus;

        notificationService.sendNotification(
                userId,
                message,
                NotificationType.TICKET_UPDATED,
                ticketId,
                "TICKET");
    }

    /**
     * Called by CommentService when someone comments on a ticket
     * Notifies the ticket creator and watchers
     * 
     * @param userId        The user to notify
     * @param ticketId      The ticket ID
     * @param commenterName The name of the person who commented
     */
    public void notifyTicketCommented(String userId, String ticketId, String commenterName) {
        log.info("Sending ticket comment notification to user {}", userId);

        String message = commenterName + " commented on ticket #" + ticketId;

        notificationService.sendNotification(
                userId,
                message,
                NotificationType.COMMENT_ADDED,
                ticketId,
                "TICKET");
    }

    /**
     * Called by CommentService when someone comments on a booking
     * Notifies the person who made the booking
     * 
     * @param userId        The user to notify (booking creator)
     * @param bookingId     The booking ID
     * @param commenterName The person who commented
     */
    public void notifyBookingCommented(String userId, String bookingId, String commenterName) {
        log.info("Sending booking comment notification to user {}", userId);

        String message = commenterName + " commented on your booking request";

        notificationService.sendNotification(
                userId,
                message,
                NotificationType.BOOKING_COMMENT,
                bookingId,
                "BOOKING");
    }

    /**
     * Generic notification sender
     * Use this for custom notifications that don't fit the above patterns
     * 
     * @param userId     User to notify
     * @param message    The message
     * @param type       The notification type
     * @param entityId   Optional entity ID (booking/ticket ID)
     * @param entityType Optional entity type (BOOKING, TICKET, etc.)
     */
    public void sendCustomNotification(
            String userId,
            String message,
            NotificationType type,
            String entityId,
            String entityType) {

        log.info("Sending custom notification to user {}", userId);

        notificationService.sendNotification(userId, message, type, entityId, entityType);
    }
}

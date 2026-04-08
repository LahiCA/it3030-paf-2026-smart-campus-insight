package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.response.NotificationDTO;
import com.smartcampus.backend.entities.Notification;
import com.smartcampus.backend.entities.User;
import com.smartcampus.backend.enums.NotificationType;
import com.smartcampus.backend.exception.UserNotFoundException;
import com.smartcampus.backend.repository.NotificationRepository;
import com.smartcampus.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * NotificationService
 * 
 * Handles all notification-related business logic:
 * - Creating notifications (system, admin, or other modules)
 * - Fetching notifications (by user, by type, unread only, etc.)
 * - Marking notifications as read/unread
 * - Deleting notifications
 * - Counting unread notifications (for the notification bell)
 * 
 * This service is key to integrating notifications with other modules.
 * When Module B (bookings) approves a booking, it calls:
 * notificationService.sendNotification(userId, "Booking approved",
 * BOOKING_APPROVED, bookingId)
 * 
 * This way, other modules don't need to know about Notification entity details.
 */
@Slf4j
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create and send a notification to a user
     * 
     * This is the main method used by other modules to send notifications.
     * Example: BookingService.approveBooking() calls this when approving a booking
     * 
     * @param userId            The user who should receive the notification
     * @param message           The notification message
     * @param type              The notification type (BOOKING_APPROVED,
     *                          TICKET_UPDATED, etc.)
     * @param relatedEntityId   Optional: booking/ticket ID
     * @param relatedEntityType Optional: BOOKING, TICKET, COMMENT, etc.
     * @return Created notification as DTO
     * @throws UserNotFoundException if user doesn't exist
     */
    public NotificationDTO sendNotification(
            Long userId,
            String message,
            NotificationType type,
            Long relatedEntityId,
            String relatedEntityType) {

        log.info("Creating notification for user ID {} with type: {}", userId, type);

        // Step 1: Find the user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new UserNotFoundException("User not found with ID: " + userId);
                });

        // Step 2: Create notification entity
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .read(false)
                .relatedEntityId(relatedEntityId)
                .relatedEntityType(relatedEntityType)
                .build();

        // Step 3: Save to database
        notification = notificationRepository.save(notification);
        log.info("Notification created with ID: {} for user: {}", notification.getId(), userId);

        // Step 4: Convert to DTO and return
        return convertToDTO(notification);
    }

    /**
     * Convenience method: Send notification without related entity
     * 
     * @param userId  The recipient
     * @param message The message
     * @param type    The type
     * @return Created notification DTO
     */
    public NotificationDTO sendNotification(
            Long userId,
            String message,
            NotificationType type) {

        return sendNotification(userId, message, type, null, null);
    }

    /**
     * Get all notifications for a user
     * Ordered by most recent first
     * 
     * @param userId The user ID
     * @return List of all notifications for that user
     */
    public List<NotificationDTO> getUserNotifications(Long userId) {
        log.debug("Fetching all notifications for user ID: {}", userId);

        // Verify user exists
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with ID: " + userId);
        }

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get only unread notifications for a user
     * Used for showing what needs attention
     * 
     * @param userId The user ID
     * @return List of unread notifications
     */
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        log.debug("Fetching unread notifications for user ID: {}", userId);

        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with ID: " + userId);
        }

        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get unread notification count for the notification bell
     * Efficient: only counts, doesn't fetch full objects
     * 
     * @param userId The user ID
     * @return Number of unread notifications
     */
    public Long getUnreadCount(Long userId) {
        log.debug("Counting unread notifications for user ID: {}", userId);

        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with ID: " + userId);
        }

        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /**
     * Get notifications by type
     * Useful for filtering: show only booking-related notifications
     * 
     * @param userId The user ID
     * @param type   The notification type
     * @return List of notifications of that type
     */
    public List<NotificationDTO> getNotificationsByType(Long userId, NotificationType type) {
        log.debug("Fetching notifications of type {} for user ID: {}", type, userId);

        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with ID: " + userId);
        }

        return notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Mark a notification as read
     * Called when user clicks on a notification or opens notification panel
     * 
     * @param notificationId The notification to mark as read
     * @param userId         The user (for security check)
     * @return Updated notification DTO
     * @throws UserNotFoundException if notification doesn't exist
     */
    public NotificationDTO markAsRead(Long notificationId, Long userId) {
        log.info("Marking notification {} as read for user {}", notificationId, userId);

        // Find the notification
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> {
                    log.error("Notification not found with ID: {}", notificationId);
                    return new UserNotFoundException("Notification not found with ID: " + notificationId);
                });

        // Security check: Ensure notification belongs to the requesting user
        if (!notification.getUser().getId().equals(userId)) {
            log.warn("User {} tried to mark notification {} they don't own", userId, notificationId);
            throw new IllegalArgumentException("You can only mark your own notifications as read");
        }

        // Mark as read
        notification.markAsRead();
        notification = notificationRepository.save(notification);

        log.info("Notification {} marked as read", notificationId);
        return convertToDTO(notification);
    }

    /**
     * Mark a notification as unread
     * User can undo reading a notification
     * 
     * @param notificationId The notification to mark as unread
     * @param userId         The user (for security check)
     * @return Updated notification DTO
     */
    public NotificationDTO markAsUnread(Long notificationId, Long userId) {
        log.info("Marking notification {} as unread for user {}", notificationId, userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new UserNotFoundException("Notification not found with ID: " + notificationId));

        // Security check
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own notifications");
        }

        notification.markAsUnread();
        notification = notificationRepository.save(notification);

        return convertToDTO(notification);
    }

    /**
     * Get a single notification by ID
     * 
     * @param notificationId The notification ID
     * @param userId         The user (for security check)
     * @return The notification DTO
     */
    public NotificationDTO getNotification(Long notificationId, Long userId) {
        log.debug("Fetching notification {} for user {}", notificationId, userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new UserNotFoundException("Notification not found with ID: " + notificationId));

        // Security check
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only access your own notifications");
        }

        return convertToDTO(notification);
    }

    /**
     * Delete a notification
     * User can delete notifications they don't want anymore
     * 
     * @param notificationId The notification to delete
     * @param userId         The user (for security check)
     */
    public void deleteNotification(Long notificationId, Long userId) {
        log.info("Deleting notification {} for user {}", notificationId, userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new UserNotFoundException("Notification not found with ID: " + notificationId));

        // Security check
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own notifications");
        }

        notificationRepository.delete(notification);
        log.info("Notification {} deleted", notificationId);
    }

    /**
     * Delete all notifications for a user
     * Caution: This deletes everything!
     * 
     * @param userId The user
     */
    public void deleteAllNotifications(Long userId) {
        log.warn("Deleting all notifications for user {}", userId);

        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with ID: " + userId);
        }

        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(notifications);

        log.info("All notifications deleted for user {}", userId);
    }

    /**
     * Convert Notification entity to NotificationDTO
     * Excludes the User object to avoid recursion
     * 
     * @param notification The entity
     * @return The DTO
     */
    private NotificationDTO convertToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .type(notification.getType().name())
                .read(notification.getRead())
                .relatedEntityId(notification.getRelatedEntityId())
                .relatedEntityType(notification.getRelatedEntityType())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .build();
    }
}

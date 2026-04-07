package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.response.NotificationDTO;
import com.smartcampus.backend.service.NotificationService;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.exception.UserNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * NotificationController - REST API for notifications
 */
@Slf4j
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/notifications - Get all notifications
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDTO>> getAllNotifications(
            Authentication authentication) {
        log.info("Fetching all notifications for user: {}", authentication.getName());
        Long userId = extractUserIdFromAuthentication(authentication);
        List<NotificationDTO> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * GET /api/notifications/unread/count - Get unread count
     */
    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            Authentication authentication) {
        log.info("Fetching unread count for user: {}", authentication.getName());
        Long userId = extractUserIdFromAuthentication(authentication);
        Long unreadCount = notificationService.getUnreadCount(userId);
        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", unreadCount);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/notifications/{id}/read - Mark as read
     */
    @PostMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDTO> markNotificationAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("Marking notification {} as read for user: {}", id, authentication.getName());
        Long userId = extractUserIdFromAuthentication(authentication);
        NotificationDTO notification = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(notification);
    }

    /**
     * PUT /api/notifications/{id} - Toggle read status
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDTO> updateNotificationReadStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication) {
        log.info("Updating notification {} for user: {}", id, authentication.getName());
        Long userId = extractUserIdFromAuthentication(authentication);
        Boolean read = request.get("read");
        if (read != null && read) {
            return ResponseEntity.ok(notificationService.markAsRead(id, userId));
        } else {
            return ResponseEntity.ok(notificationService.markAsUnread(id, userId));
        }
    }

    /**
     * DELETE /api/notifications/{id} - Delete notification
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("Deleting notification {} for user: {}", id, authentication.getName());
        Long userId = extractUserIdFromAuthentication(authentication);
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Listener endpoints for other services
     */
    @PostMapping("/listener/booking-approved")
    public ResponseEntity<Void> onBookingApproved(@RequestBody Map<String, Object> payload) {
        log.info("Booking approved notification: {}", payload);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/listener/booking-rejected")
    public ResponseEntity<Void> onBookingRejected(@RequestBody Map<String, Object> payload) {
        log.info("Booking rejected notification: {}", payload);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/listener/ticket-created")
    public ResponseEntity<Void> onTicketCreated(@RequestBody Map<String, Object> payload) {
        log.info("Ticket created notification: {}", payload);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/listener/ticket-status-changed")
    public ResponseEntity<Void> onTicketStatusChanged(@RequestBody Map<String, Object> payload) {
        log.info("Ticket status changed notification: {}", payload);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/listener/ticket-commented")
    public ResponseEntity<Void> onTicketCommented(@RequestBody Map<String, Object> payload) {
        log.info("Ticket commented notification: {}", payload);
        return ResponseEntity.ok().build();
    }

    /**
     * Helper method: Extract user ID from authentication
     */
    private Long extractUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email))
                .getId();
    }
}

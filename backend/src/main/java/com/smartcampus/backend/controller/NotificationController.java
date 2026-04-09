package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.request.AdminNotificationRequest;
import com.smartcampus.backend.dto.request.CreateNotificationRequest;
import com.smartcampus.backend.dto.response.NotificationDTO;
import com.smartcampus.backend.dto.response.NotificationPreferenceDTO;
import com.smartcampus.backend.enums.NotificationType;
import com.smartcampus.backend.service.NotificationService;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.exception.UserNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
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
        String userId = extractUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.ok(List.of());
        }
        List<NotificationDTO> notifications = notificationService.getUserNotificationsWithBroadcasts(userId);
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
        String userId = extractUserIdFromAuthentication(authentication);
        Map<String, Long> response = new HashMap<>();
        if (userId == null) {
            response.put("unreadCount", 0L);
            return ResponseEntity.ok(response);
        }
        long unreadCount = notificationService.getUnreadCountWithBroadcasts(userId);
        response.put("unreadCount", unreadCount);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/notifications/{id}/read - Mark as read
     */
    @PostMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDTO> markNotificationAsRead(
            @PathVariable String id,
            Authentication authentication) {
        log.info("Marking notification {} as read for user: {}", id, authentication.getName());
        String userId = extractUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.notFound().build();
        }
        NotificationDTO notification = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(notification);
    }

    /**
     * PUT /api/notifications/{id} - Toggle read status
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDTO> updateNotificationReadStatus(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication) {
        log.info("Updating notification {} for user: {}", id, authentication.getName());
        String userId = extractUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.notFound().build();
        }
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
            @PathVariable String id,
            Authentication authentication) {
        log.info("Deleting notification {} for user: {}", id, authentication.getName());
        String userId = extractUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.notFound().build();
        }
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/notifications/mark-all-read - Mark all notifications as read
     */
    @PostMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        log.info("Marking all notifications as read for user: {}", authentication.getName());
        String userId = extractUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.ok().build();
        }
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * DELETE /api/notifications - Delete all notifications
     */
    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteAllNotifications(Authentication authentication) {
        log.info("Deleting all notifications for user: {}", authentication.getName());
        String userId = extractUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.noContent().build();
        }
        notificationService.deleteAllNotifications(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/notifications - Create a personal notification for a specific user (ADMIN only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationDTO> createNotification(
            @Valid @RequestBody CreateNotificationRequest request) {
        log.info("Admin creating notification for user: {}", request.getUserId());
        NotificationDTO notification = notificationService.sendNotification(
                request.getUserId(),
                request.getMessage(),
                NotificationType.valueOf(request.getType()),
                request.getRelatedEntityId(),
                request.getRelatedEntityType());
        return ResponseEntity.status(201).body(notification);
    }

    // ==================== Admin Notification Management ====================

    /**
     * GET /api/notifications/admin - List all broadcast notifications (ADMIN only)
     */
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NotificationDTO>> adminGetAllNotifications() {
        log.info("Admin fetching all broadcast notifications");
        return ResponseEntity.ok(notificationService.adminGetAllNotifications());
    }

    /**
     * POST /api/notifications/admin - Create broadcast notification (ADMIN only)
     */
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationDTO> adminCreateNotification(
            @Valid @RequestBody AdminNotificationRequest request) {
        log.info("Admin creating broadcast notification: audience={}", request.getTargetAudience());
        NotificationDTO dto = notificationService.adminCreateNotification(request);
        return ResponseEntity.status(201).body(dto);
    }

    /**
     * PUT /api/notifications/admin/{id} - Update broadcast notification (ADMIN only)
     */
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NotificationDTO> adminUpdateNotification(
            @PathVariable String id,
            @Valid @RequestBody AdminNotificationRequest request) {
        log.info("Admin updating broadcast notification: {}", id);
        NotificationDTO dto = notificationService.adminUpdateNotification(id, request);
        return ResponseEntity.ok(dto);
    }

    /**
     * DELETE /api/notifications/admin/{id} - Delete notification (ADMIN only)
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> adminDeleteNotification(@PathVariable String id) {
        log.info("Admin deleting notification: {}", id);
        notificationService.adminDeleteNotification(id);
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
     * Returns null if user not found (e.g. fresh H2 database after restart)
     */
    private String extractUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(user -> user.getId())
                .orElse(null);
    }

    // ==================== Notification Preferences ====================

    /**
     * GET /api/notifications/preferences - Get user's notification preferences
     */
    @GetMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationPreferenceDTO> getPreferences(Authentication authentication) {
        String userId = extractUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.ok(new NotificationPreferenceDTO());
        }
        NotificationPreferenceDTO prefs = notificationService.getPreferences(userId);
        return ResponseEntity.ok(prefs);
    }

    /**
     * PUT /api/notifications/preferences - Update user's notification preferences
     */
    @PutMapping("/preferences")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationPreferenceDTO> updatePreferences(
            @RequestBody NotificationPreferenceDTO request,
            Authentication authentication) {
        String userId = extractUserIdFromAuthentication(authentication);
        if (userId == null) {
            return ResponseEntity.notFound().build();
        }
        NotificationPreferenceDTO prefs = notificationService.updatePreferences(userId, request);
        return ResponseEntity.ok(prefs);
    }
}

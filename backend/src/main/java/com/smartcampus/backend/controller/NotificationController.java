package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.response.NotificationDTO;
import com.smartcampus.backend.service.NotificationService;
import com.smartcampus.backend.repository.UserRepository;
import com.smartcampus.backend.exception.UserNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * NotificationController
 * 
 * REST controller for notification operations.
 * 
 * Key Endpoints (4 Required):
 * 1. GET /api/notifications — Get all notifications
 * 2. POST /api/notifications/{id}/read — Mark as read
 * 3. PUT /api/notifications/{id} — Toggle read status (or update)
 * 4. DELETE /api/notifications/{id} — Delete notification
 * 
 * All endpoints require authentication (JWT token)
 * Users can only access their own notifications (security check in service)
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
     * ============================================================
     * ENDPOINT 1: GET /api/notifications
     * Fetch all notifications for the current user
     * ============================================================
     * 
     * HTTP Method: GET
     * Path: /api/notifications
     * Authentication: Required (any authenticated user)
     * Parameters: None (uses authenticated user from JWT)
     * 
     * Status Codes:
     * - 200 OK: Successfully returned list of notifications
     * - 401 Unauthorized: No JWT token provided
     * - 404 Not Found: User doesn't exist
     * 
     * Response (200 OK):
     * [
     * {
     * "id": 5,
     * "message": "Your booking for Sports Complex has been approved",
     * "type": "BOOKING_APPROVED",
     * "read": false,
     * "relatedEntityId": 12,
     * "relatedEntityType": "BOOKING",
     * "createdAt": "2026-04-06T10:00:00",
     * "readAt": null
     * },
     * {
     * "id": 4,
     * "message": "Ticket #456 status changed to IN_PROGRESS",
     * "type": "TICKET_UPDATED",
     * "read": true,
     * "relatedEntityId": 456,
     * "relatedEntityType": "TICKET",
     * "createdAt": "2026-04-05T14:30:00",
     * "readAt": "2026-04-05T14:35:00"
     * }
     * ]
     * 
     * Query Parameters (Optional extensions):
     * - ?unread=true — Get only unread notifications
     * - ?type=BOOKING_APPROVED — Filter by type
     * 
     * Use Case:
     * - Load notifications page on app startup
     * - Refresh notification list
     * - Show all notifications in sidebar
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(
            @RequestParam(required = false) Boolean unread,
            Authentication authentication) {
        
        log.info("Fetching notifications for user: {}", authentication.getName());
        
        // Extract user ID from JWT token
        Long userId = extractUserIdFromAuthentication(authentication);
        
        // Support optional query parameter ?unread=true to get only unread
        List<NotificationDTO> notifications;
        if (unread != null && unread) {
            notifications = notificationService.getUnreadNotifications(userId);
        } else {
            notifications = notificationService.getUserNotifications(userId);
        }

    /**
     * ============================================================
     * ENDPOINT 2: POST /api/notifications/{id}/read
     * Mark a single notification as read
     * ============================================================
     * 
     * HTTP Method: POST
     * Path: /api/notifications/{id}/read
     * Authentication: Required
     * Parameters: id (path parameter — the notification ID)
     * 
     * Status Codes:
     * - 200 OK: Successfully marked as read
     * - 401 Unauthorized: No JWT or invalid JWT
     * - 404 Not Found: Notification doesn't exist
     * - 403 Forbidden: Notification belongs to another user
     * 
     * Request Body: Empty
     * 
     * Response (200 OK):
     * {
     * "id": 5,
     * "message": "Your booking for Sports Complex has been approved",
     * "type": "BOOKING_APPROVED",
     * "read": true, ← Changed from false
     * "readAt": "2026-04-06T10:05:00" ← Now has timestamp
     * }
     * 
     * Why POST instead of PATCH?
     * This is a state change action: "mark as read"
     * While we could use PATCH, POST is idiomatic for actions like:
     * - /email/{id}/send
     * - /job/{id}/start
     * - /notification/{id}/read
     * 
     * Alternative: Some APIs use PATCH instead. Both are acceptable.
     * 
     * Use Case:
     * - User clicks on a notification
     * - Notification bell tracks reads to clear badges
     * - User opens notification panel
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
     * ============================================================
     * ENDPOINT 3: PUT /api/notifications/{id}
     * Toggle read status (or update notification)
     * ============================================================
     * 
     * HTTP Method: PUT
     * Path: /api/notifications/{id}
     * Authentication: Required
     * Parameters: id (path parameter)
     * 
     * Status Codes:
     * - 200 OK: Successfully updated
     * - 400 Bad Request: Invalid request body
     * - 401 Unauthorized: No JWT
     * - 404 Not Found: Notification doesn't exist
     * - 403 Forbidden: Not your notification
     * 
     * Request Body:
     * {
     * "read": false ← Set to opposite of current state
     * }
     * 
     * Response (200 OK):
     * Same as POST /read endpoint
     * 
     * Alternative Implementation:
     * This endpoint could accept a full notification update:
     * {
     * "read": false,
     * "message": "New message (if admin)"
     * }
     * But for this assignment, toggling read status is sufficient.
     * 
     * Why PUT vs PATCH?
     * - PUT: Full resource replacement (less common for notifications)
     * - PATCH: Partial update (more semantically correct here)
     * For simplicity, we'll implement toggle behavior with PUT.
     * 
     * Use Case:
     * - User wants to mark a read notification as unread again
     * - "Hide read notifications" feature
     * - Undo read action
     */
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NotificationDTO> updateNotificationReadStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request,
            Authentication authentication) {

        log.info("Updating notification {} for user: {}", id, authentication.getName());

        Long userId = extractUserIdFromAuthentication(authentication);

        // Get the current notification state
        NotificationDTO current = notificationService.getNotification(id, userId);

        // Toggle the read status based on request body
        Boolean shouldBeRead = request.getOrDefault("read", !current.getRead());

        NotificationDTO notification;
        if (shouldBeRead) {
            notification = notificationService.markAsRead(id, userId);
        } else {
            notification = notificationService.markAsUnread(id, userId);
        }

        return ResponseEntity.ok(notification);
    }

    /**
     * ============================================================
     * ENDPOINT 4: DELETE /api/notifications/{id}
     * Delete a single notification
     * ============================================================
     * 
     * HTTP Method: DELETE
     * Path: /api/notifications/{id}
     * Authentication: Required
     * Parameters: id (path parameter)
     * 
     * Status Codes:
     * - 204 No Content: Successfully deleted (no body returned)
     * - 401 Unauthorized: No JWT
     * - 403 Forbidden: Not your notification
     * - 404 Not Found: Notification doesn't exist
     * 
     * Request Body: Empty
     * Response Body: Empty (204 No Content)
     * 
     * Why 204 No Content?
     * Standard REST convention: DELETE returns 204 if successful
     * There's no entity to return after deletion
     * 
     * Alternative Response (less common):
     * Some APIs return 200 OK with confirmation message
     * But 204 is the proper HTTP standard for DELETE
     * 
     * Use Case:
     * - User clears a notification
     * - "Mark notification as read" + "delete after 7 days"
     * - Clean up notification history
     * - User removes spam/unwanted notifications
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {

        log.info("Deleting notification {} for user: {}", id, authentication.getName());

        Long userId = extractUserIdFromAuthentication(authentication);

        notificationService.deleteNotification(id, userId);

        // Return 204 No Content (no body, just status code)
        return ResponseEntity.noContent().build();
    }

    /**
     * ============================================================
     * BONUS: GET /api/notifications/unread/count
     * Get unread notification count (for notification bell badge)
     * ============================================================
     * 
     * HTTP Method: GET
     * Path: /api/notifications/unread/count
     * Authentication: Required
     * 
     * Response (200 OK):
     * {
     * "unreadCount": 3
     * }
     * 
     * Use Case:
     * - Notification bell shows "3" badge
     * - Called on app startup
     * - Called after marking notification as read
     * - Frontend polls this endpoint every 30 seconds
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
     * Helper method: Extract user ID from JWT authentication
     * 
     * The JWT contains the email (set as principal in JwtAuthenticationFilter).
     * We look up the user in the database to get their ID.
     * 
     * @param authentication Spring Authentication object from JWT
     * @return The user ID
     * @throws UserNotFoundException if user doesn't exist in database
     */
    private Long extractUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email))
                .getId();
    }
}

package com.smartcampus.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * NotificationDTO
 * 
 * Used when returning notification data to the frontend.
 * Contains all information needed to display the notification.
 * 
 * Example JSON response:
 * {
 * "id": 5,
 * "message": "Your booking for Sports Complex has been approved",
 * "type": "BOOKING_APPROVED",
 * "read": false,
 * "relatedEntityId": 12,
 * "relatedEntityType": "BOOKING",
 * "createdAt": "2026-04-06T10:00:00",
 * "readAt": null
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {

    /**
     * MongoDB auto-generated unique notification ID
     */
    private String id;

    /**
     * Human-readable display ID (e.g. NOTF000001)
     */
    private String displayId;

    /**
     * The notification message to display
     */
    private String message;

    /**
     * The notification type (BOOKING_APPROVED, TICKET_UPDATED, etc.)
     */
    private String type;

    /**
     * Whether the notification has been read
     * Used to show unread indicator (e.g., red dot on notification bell)
     */
    private Boolean read;

    /**
     * Optional: The ID of the related entity
     * Frontend uses this to create a link to the booking/ticket page
     * Example: If relatedEntityId=5 and relatedEntityType=BOOKING,
     * frontend links to /bookings/5
     */
    private String relatedEntityId;

    /**
     * Optional: The type of related entity (BOOKING, TICKET, COMMENT, etc.)
     */
    private String relatedEntityType;

    /**
     * Target audience for broadcast notifications (ALL, ADMIN, LECTURER, TECHNICIAN)
     */
    private String targetAudience;

    /**
     * When the notification was created
     * Displayed as "3 hours ago" or "April 6, 10:00 AM"
     */
    private LocalDateTime createdAt;

    /**
     * When the user marked it as read
     * Null if never read
     * Useful for showing "read at" timestamp
     */
    private LocalDateTime readAt;
}

package com.smartcampus.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CreateNotificationRequest
 * 
 * Sent to create a new notification for a user.
 * Can be used by:
 * - The system itself (when booking is approved)
 * - Admins (sending manual notifications)
 * - Other microservices/modules
 * 
 * Example request body:
 * {
 * "userId": 5,
 * "message": "Your booking for Sports Complex has been approved",
 * "type": "BOOKING_APPROVED",
 * "relatedEntityId": 12,
 * "relatedEntityType": "BOOKING"
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateNotificationRequest {

    /**
     * The user who should receive this notification
     */
    @NotBlank(message = "User ID cannot be blank")
    private String userId;

    /**
     * The notification message
     */
    @NotBlank(message = "Message cannot be blank")
    private String message;

    /**
     * The notification type
     * Valid values: BOOKING_APPROVED, BOOKING_REJECTED, TICKET_CREATED,
     * TICKET_UPDATED, COMMENT_ADDED, BOOKING_COMMENT, GENERAL
     */
    @NotBlank(message = "Notification type cannot be blank")
    private String type;

    /**
     * Optional: If this notification is about a specific booking/ticket
     * Set this to the booking or ticket ID
     */
    private String relatedEntityId;

    /**
     * Optional: The type of entity (BOOKING, TICKET, COMMENT, USER)
     */
    private String relatedEntityType;
}

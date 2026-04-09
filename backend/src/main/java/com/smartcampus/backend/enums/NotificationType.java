package com.smartcampus.backend.enums;

/**
 * NotificationType Enum
 * 
 * Defines all types of notifications in the system.
 * Using an enum is better than strings because:
 * - IDE autocomplete works
 * - Can't misspell notification types
 * - Easy to add new types
 * - Type-safe checks at compile time
 * 
 * Each type describes what event triggered the notification.
 */
public enum NotificationType {

    /**
     * A facility booking was approved by an admin
     * Message example: "Your booking for Sports Complex on April 10 has been
     * approved"
     */
    BOOKING_APPROVED("Booking Approved", "Your facility booking has been approved"),

    /**
     * A facility booking was rejected
     * Message example: "Your booking for Lab on April 10 was rejected due to
     * maintenance"
     */
    BOOKING_REJECTED("Booking Rejected", "Your facility booking was rejected"),

    /**
     * A new incident ticket was created/assigned
     * Message example: "New maintenance ticket #123 assigned to you"
     */
    TICKET_CREATED("Ticket Created", "A new incident ticket has been created"),

    /**
     * An incident ticket status was updated
     * Message example: "Ticket #123 status changed to IN_PROGRESS"
     */
    TICKET_UPDATED("Ticket Updated", "An incident ticket has been updated"),

    /**
     * Someone commented on a ticket
     * Message example: "New comment on ticket #456 you're following"
     */
    COMMENT_ADDED("Comment Added", "New comment on a ticket you're following"),

    /**
     * Someone commented on a booking
     * Message example: "New comment on your booking request"
     */
    BOOKING_COMMENT("Booking Comment", "New comment on your booking"),

    /**
     * Generic system notification
     * Used for miscellaneous alerts that don't fit other types
     */
    GENERAL("General Notification", "System notification");

    /**
     * Short title for the notification type
     * Displayed in the UI
     */
    private final String title;

    /**
     * Default message template
     * Can be overridden with specific details
     */
    private final String defaultMessage;

    /**
     * Constructor
     */
    NotificationType(String title, String defaultMessage) {
        this.title = title;
        this.defaultMessage = defaultMessage;
    }

    /**
     * Get human-readable title
     */
    public String getTitle() {
        return title;
    }

    /**
     * Get default message template
     */
    public String getDefaultMessage() {
        return defaultMessage;
    }

    /**
     * Convert string to NotificationType enum
     * 
     * @param typeString e.g., "BOOKING_APPROVED"
     * @return NotificationType enum value
     */
    public static NotificationType fromString(String typeString) {
        if (typeString == null) {
            return GENERAL;
        }

        try {
            return NotificationType.valueOf(typeString.toUpperCase());
        } catch (IllegalArgumentException e) {
            return GENERAL; // Default to GENERAL if invalid
        }
    }
}

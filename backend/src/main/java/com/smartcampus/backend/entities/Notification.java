package com.smartcampus.backend.entities;

import com.smartcampus.backend.enums.NotificationType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Notification Entity
 * 
 * Represents a single notification in the database.
 * Each notification is tied to a user and tracks:
 * - What the notification is about (message, type)
 * - Whether it's been read
 * - When it was created and read
 * - Optional: what entity it relates to (booking ID, ticket ID, etc.)
 * 
 * Table: notifications
 * 
 * Example rows:
 * id | user_id | message | type | read | createdAt | readAt
 * 1 | 5 | "Your booking approved" | BOOKING_APPROVED | false |
 * 2026-04-06T10:00:00 | null
 * 2 | 5 | "Ticket #123 updated" | TICKET_UPDATED | true | 2026-04-05T14:30:00 |
 * 2026-04-05T14:35:00
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notifications")
public class Notification {

    /**
     * Unique notification ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user who receives this notification
     * Foreign key relationship to users table
     * If user is deleted, cascade delete notifications
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * The notification message to display to the user
     * Examples:
     * - "Your facility booking for Sports Complex on April 10 has been approved"
     * - "Ticket #456 status changed to IN_PROGRESS"
     * - "3 new bookings pending review"
     */
    @NotBlank(message = "Notification message cannot be blank")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /**
     * The type of notification (enum)
     * Allows grouping/filtering notifications by type
     * Examples: BOOKING_APPROVED, TICKET_UPDATED, COMMENT_ADDED
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    /**
     * Whether the user has read this notification
     * Default: false (unread)
     * Set to true when user marks as read
     * Used for notification bell badge (showing unread count)
     */
    @Column(nullable = false)
    private Boolean read = false;

    /**
     * Optional: The ID of the related entity
     * For example, if this notification is about booking #5,
     * relatedEntityId = 5
     * This allows frontend to link to the booking/ticket page
     */
    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    /**
     * Optional: The type of entity referenced
     * Examples: "BOOKING", "TICKET", "COMMENT", "USER"
     * Helps frontend know what type of entity to fetch details for
     */
    @Column(name = "related_entity_type")
    private String relatedEntityType;

    /**
     * When this notification was created
     * Set automatically by database or application
     * Displayed in notification list with timestamp
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * When the user marked this notification as read
     * Null if notification hasn't been read yet
     * Useful for analytics (how long until user reads?)
     */
    @Column(name = "read_at")
    private LocalDateTime readAt;

    /**
     * Lifecycle callback: Set createdAt before inserting
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Helper method: Mark notification as read
     * Also records the time it was read
     */
    public void markAsRead() {
        this.read = true;
        this.readAt = LocalDateTime.now();
    }

    /**
     * Helper method: Mark notification as unread
     * Clears the readAt timestamp
     */
    public void markAsUnread() {
        this.read = false;
        this.readAt = null;
    }
}

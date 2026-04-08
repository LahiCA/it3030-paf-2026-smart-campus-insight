package com.smartcampus.backend.entities;

import com.smartcampus.backend.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Notification Document (MongoDB)
 * 
 * Represents a single notification stored in MongoDB.
 * Each notification is tied to a user via userId and tracks:
 * - What the notification is about (message, type)
 * - Whether it's been read
 * - When it was created and read
 * - Optional: what entity it relates to (booking ID, ticket ID, etc.)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    /**
     * The user who receives this notification (reference by ID)
     */
    @Indexed
    private String userId;

    @NotBlank(message = "Notification message cannot be blank")
    private String message;

    private NotificationType type;

    @lombok.Builder.Default
    private Boolean read = false;

    private String relatedEntityId;

    private String relatedEntityType;

    @lombok.Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime readAt;

    /**
     * Helper method: Mark notification as read
     */
    public void markAsRead() {
        this.read = true;
        this.readAt = LocalDateTime.now();
    }

    /**
     * Helper method: Mark notification as unread
     */
    public void markAsUnread() {
        this.read = false;
        this.readAt = null;
    }
}

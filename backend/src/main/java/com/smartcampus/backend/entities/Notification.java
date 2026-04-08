package com.smartcampus.backend.entities;

import com.smartcampus.backend.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    /** Human-readable display ID, e.g. NOTF000001 */
    private String displayId;

    private String userId;

    @NotBlank(message = "Notification message cannot be blank")
    private String message;

    private NotificationType type;

    @lombok.Builder.Default
    private Boolean read = false;

    private String relatedEntityId;

    private String relatedEntityType;

    /**
     * Target audience for broadcast notifications (ALL, ADMIN, LECTURER, TECHNICIAN).
     * When set, the notification is shown to all users with that role instead of a specific userId.
     */
    private String targetAudience;

    @lombok.Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime readAt;

    public void markAsRead() {
        this.read = true;
        this.readAt = LocalDateTime.now();
    }

    public void markAsUnread() {
        this.read = false;
        this.readAt = null;
    }
}


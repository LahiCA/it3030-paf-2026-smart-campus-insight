package com.smartcampus.backend.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * NotificationPreference Document (MongoDB)
 *
 * Stores per-user notification preferences.
 * Each user has one preferences document controlling which notification types
 * they want.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "notification_preferences")
public class NotificationPreference {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    @lombok.Builder.Default
    private Boolean bookingApproved = true;

    @lombok.Builder.Default
    private Boolean bookingRejected = true;

    @lombok.Builder.Default
    private Boolean ticketCreated = true;

    @lombok.Builder.Default
    private Boolean ticketUpdated = true;

    @lombok.Builder.Default
    private Boolean commentAdded = true;

    @lombok.Builder.Default
    private Boolean bookingComment = true;

    @lombok.Builder.Default
    private Boolean general = true;

    @lombok.Builder.Default
    private Boolean emailNotifications = false;

    @lombok.Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}

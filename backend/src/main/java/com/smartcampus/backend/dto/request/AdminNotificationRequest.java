package com.smartcampus.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AdminNotificationRequest
 * 
 * Used by admin to broadcast a notification to all users of a specific audience.
 * The targetAudience field can be: ALL, ADMIN, LECTURER, TECHNICIAN
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminNotificationRequest {

    @NotBlank(message = "Message cannot be blank")
    private String message;

    @NotBlank(message = "Notification type cannot be blank")
    private String type;

    /**
     * Who should see this notification: ALL, ADMIN, LECTURER, TECHNICIAN
     */
    @NotBlank(message = "Target audience cannot be blank")
    private String targetAudience;
}

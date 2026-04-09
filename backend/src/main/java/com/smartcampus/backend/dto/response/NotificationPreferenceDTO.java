package com.smartcampus.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferenceDTO {

    private String id;
    private String userId;
    private Boolean bookingApproved;
    private Boolean bookingRejected;
    private Boolean ticketCreated;
    private Boolean ticketUpdated;
    private Boolean commentAdded;
    private Boolean bookingComment;
    private Boolean general;
    private Boolean emailNotifications;
}

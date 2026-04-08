package com.smartcampus.backend.tickets.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "OPEN|IN_PROGRESS|RESOLVED|CLOSED|REJECTED", message = "Invalid ticket status")
    private String status;

    @Size(max = 1000, message = "Resolution notes must be less than 1000 characters")
    private String resolutionNotes;

    @Size(max = 1000, message = "Rejection reason must be less than 1000 characters")
    private String rejectionReason;
}

package com.smartcampus.backend.bookingworkflow.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BookingRequestDto {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Resource name is required")
    private String resourceName;

    @NotBlank(message = "Resource type is required")
    private String resourceType;

    @NotBlank(message = "Booking date is required")
    private String bookingDate;

    @NotBlank(message = "Start time is required")
    private String startTime;

    @NotBlank(message = "End time is required")
    private String endTime;

    @NotBlank(message = "Purpose is required")
    private String purpose;

    @Min(value = 1, message = "Expected attendees must be at least 1")
    private Integer expectedAttendees;
}
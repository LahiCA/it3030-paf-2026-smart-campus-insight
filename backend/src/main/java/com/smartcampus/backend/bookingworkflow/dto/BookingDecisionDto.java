package com.smartcampus.backend.bookingworkflow.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BookingDecisionDto {

    @NotBlank(message = "Reason is required")
    private String reason;
}
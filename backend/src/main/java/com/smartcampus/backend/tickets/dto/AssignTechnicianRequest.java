package com.smartcampus.backend.tickets.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignTechnicianRequest {

    @NotBlank(message = "Technician ID is required")
    private String assignedTo;
}

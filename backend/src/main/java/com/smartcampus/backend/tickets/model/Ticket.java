package com.smartcampus.backend.tickets.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

@Document(collection = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotBlank(message = "Location is required")
    private String location;

    private String resourceId; // optional

    @NotBlank(message = "Contact details are required")
    private String contactDetails;

    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED

    private String assignedTo;

    private String resolutionNote;

    private String rejectionReason;

    private LocalDateTime createdAt = LocalDateTime.now();
}
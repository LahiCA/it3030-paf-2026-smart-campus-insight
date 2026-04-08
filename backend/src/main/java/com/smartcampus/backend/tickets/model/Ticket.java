package com.smartcampus.backend.tickets.model;

import lombok.*;

import org.bson.types.ObjectId;
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
    private ObjectId id;

    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Description is required")
    private String description;

    private String category;
    private String priority;

    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED

    private String resourceId;
    private String createdBy;
    private String assignedTo;

    private String resolutionNote;

    private LocalDateTime createdAt = LocalDateTime.now();
}
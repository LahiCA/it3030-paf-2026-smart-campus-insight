package com.smartcampus.backend.tickets.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Ticket {

    @Id
    private String id;

    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private String userId;
    private String assignedTo;
    private String resolutionNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Builder.Default
    @Transient
    private List<TicketImage> attachments = new ArrayList<>();

    @Builder.Default
    @Transient
    private List<Comment> comments = new ArrayList<>();
}

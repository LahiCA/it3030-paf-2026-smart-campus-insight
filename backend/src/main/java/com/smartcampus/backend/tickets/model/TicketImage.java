package com.smartcampus.backend.tickets.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "ticket_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketImage {

    @Id
    private String id;

    private String ticketId;
    private String fileName;
    private String filePath;
    private String contentType;
    private LocalDateTime uploadedAt;
}

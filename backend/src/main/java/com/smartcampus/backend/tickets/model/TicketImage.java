package com.smartcampus.backend.tickets.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "ticket_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketImage {

    @Id
    private String id;

    private String ticketId;
    private String imagePath;
}
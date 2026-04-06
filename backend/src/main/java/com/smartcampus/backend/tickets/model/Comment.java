package com.smartcampus.backend.tickets.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Comment {

    @Id
    private String id;

    private String ticketId;
    private String userId;

    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();
}
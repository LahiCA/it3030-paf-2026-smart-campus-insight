package com.smartcampus.backend.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Booking Document (MongoDB) - Stub for Module B
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String status = "PENDING";

    private LocalDateTime createdAt = LocalDateTime.now();
}

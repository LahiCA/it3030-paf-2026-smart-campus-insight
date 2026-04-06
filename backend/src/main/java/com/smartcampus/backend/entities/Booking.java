package com.smartcampus.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Booking Entity (Stub for Module B)
 * 
 * This is a placeholder entity for bookings.
 * Your teammate in Module B will expand this with real functionality.
 * 
 * For now, it has the basic fields to satisfy the User entity's relationship.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user who made the booking
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Booking status: PENDING, APPROVED, REJECTED, COMPLETED
     */
    @Column(nullable = false)
    private String status = "PENDING";

    /**
     * When this booking was created
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

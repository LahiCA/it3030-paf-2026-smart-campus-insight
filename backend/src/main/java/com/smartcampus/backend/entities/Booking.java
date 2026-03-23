package com.smartcampus.backend.entities;

import java.time.LocalDate;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
@Table(name = "boookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Check-in date is required")
    private LocalDate checkinDate;
    @NotNull(message = "Check-out date is required")
    private LocalDate checkoutDate;

    private String time_range;
    private String purpose;
    private String attendees;
    private String bookingConfirmationCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id")
    private Resource resource;

    @Override
    public String toString() {
        return "Booking{" +
                "id=" + id +
                ", checkinDate=" + checkinDate +
                ", checkoutDate=" + checkoutDate +
                ", time_range='" + time_range + '\'' +
                ", purpose='" + purpose + '\'' +
                ", attendees='" + attendees + '\'' +
                ", bookingConfirmationCode='" + bookingConfirmationCode + '\'' +
                ", user=" + user +
                ", resource=" + resource +
                '}';
    }
}

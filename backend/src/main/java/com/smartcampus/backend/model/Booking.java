package com.smartcampus.backend.model;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "bookings")
public class Booking {

    @Id
    private String id;

    @NotNull(message = "Check-in date is required")
    private LocalDate checkinDate;
    @NotNull(message = "Check-out date is required")
    private LocalDate checkoutDate;

    private String time_range;
    private String purpose;
    private String attendees;
    private String bookingConfirmationCode;

    @DBRef
    private User user;

    @DBRef
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

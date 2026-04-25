package com.smartcampus.backend.bookingworkflow.repository;
/*Connects service code to MongoDB */
import com.smartcampus.backend.bookingworkflow.model.Booking;
import com.smartcampus.backend.bookingworkflow.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    /*all bookings of one user */
    List<Booking> findByUserId(String userId);

    List<Booking> findByStatus(BookingStatus status);

    /*bookings for a resource on a specific date. */
    List<Booking> findByResourceNameAndBookingDate(String resourceName, LocalDate bookingDate);
}
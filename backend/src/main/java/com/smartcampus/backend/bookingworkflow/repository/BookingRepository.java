package com.smartcampus.backend.bookingworkflow.repository;

import com.smartcampus.backend.bookingworkflow.model.Booking;
import com.smartcampus.backend.bookingworkflow.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByResourceIdAndBookingDate(String resourceId, LocalDate bookingDate);
}
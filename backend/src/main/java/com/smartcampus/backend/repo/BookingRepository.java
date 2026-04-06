package com.smartcampus.backend.repo;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.smartcampus.backend.entities.Booking;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByBookingConfirmationCode(String bookingConfirmationCode);

}

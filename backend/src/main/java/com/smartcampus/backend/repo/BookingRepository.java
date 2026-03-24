package com.smartcampus.backend.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartcampus.backend.entities.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);
    List<Booking> findByResourceId(Long resourceId);
    List<Booking> findByBookingConfirmationCode(String bookingConfirmationCode);

}

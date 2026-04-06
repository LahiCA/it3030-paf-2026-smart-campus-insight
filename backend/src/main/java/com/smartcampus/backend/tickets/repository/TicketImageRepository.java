package com.smartcampus.backend.tickets.repository;

import com.smartcampus.backend.tickets.model.TicketImage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketImageRepository extends MongoRepository<TicketImage, String> {
    List<TicketImage> findByTicketId(String ticketId);
}
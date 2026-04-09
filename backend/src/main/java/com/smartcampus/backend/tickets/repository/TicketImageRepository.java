package com.smartcampus.backend.tickets.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.backend.tickets.model.TicketImage;

public interface TicketImageRepository extends MongoRepository<TicketImage, String> {

    List<TicketImage> findByTicketIdOrderByUploadedAtAsc(String ticketId);

    List<TicketImage> findByTicketId(String ticketId);
}

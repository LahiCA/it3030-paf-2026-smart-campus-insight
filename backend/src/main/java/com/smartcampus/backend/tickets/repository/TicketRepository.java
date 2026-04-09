package com.smartcampus.backend.tickets.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.backend.tickets.model.Ticket;

public interface TicketRepository extends MongoRepository<Ticket, String> {

    List<Ticket> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Ticket> findByAssignedToOrderByCreatedAtDesc(String assignedTo);
}

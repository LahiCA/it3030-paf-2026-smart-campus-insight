package com.smartcampus.backend.tickets.repository;

import com.smartcampus.backend.tickets.model.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TicketRepository extends MongoRepository<Ticket, String> {
}
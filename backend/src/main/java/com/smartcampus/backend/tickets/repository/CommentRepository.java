package com.smartcampus.backend.tickets.repository;

import com.smartcampus.backend.tickets.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByTicketId(String ticketId);
}
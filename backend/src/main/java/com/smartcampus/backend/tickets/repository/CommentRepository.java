package com.smartcampus.backend.tickets.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.backend.tickets.model.Comment;

public interface CommentRepository extends MongoRepository<Comment, String> {

    List<Comment> findByTicketIdOrderByCreatedAtAsc(String ticketId);

    List<Comment> findByTicketId(String ticketId);
}

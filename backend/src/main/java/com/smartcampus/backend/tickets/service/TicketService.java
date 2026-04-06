package com.smartcampus.backend.tickets.service;

import com.smartcampus.backend.tickets.model.*;
import com.smartcampus.backend.tickets.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepo;
    private final CommentRepository commentRepo;
    private final TicketImageRepository imageRepo;

    public TicketService(TicketRepository ticketRepo,
            CommentRepository commentRepo,
            TicketImageRepository imageRepo) {
        this.ticketRepo = ticketRepo;
        this.commentRepo = commentRepo;
        this.imageRepo = imageRepo;
    }

    // CREATE TICKET
    public Ticket createTicket(Ticket ticket) {
        ticket.setStatus("OPEN");
        return ticketRepo.save(ticket);
    }

    // GET ALL
    public List<Ticket> getAllTickets() {
        return ticketRepo.findAll();
    }

    // GET BY ID
    public Ticket getTicketById(String id) {
        return ticketRepo.findById(id).orElseThrow();
    }

    // UPDATE STATUS
    public Ticket updateStatus(String id, String status) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(status);
        return ticketRepo.save(ticket);
    }

    // ASSIGN TECHNICIAN
    public Ticket assignTechnician(String id, String techId) {
        Ticket ticket = getTicketById(id);
        ticket.setAssignedTo(techId);
        return ticketRepo.save(ticket);
    }

    // ADD COMMENT
    public Comment addComment(Comment comment) {
        return commentRepo.save(comment);
    }

    // GET COMMENTS
    public List<Comment> getComments(String ticketId) {
        return commentRepo.findByTicketId(ticketId);
    }

    // SAVE IMAGE
    public TicketImage saveImage(TicketImage img) {
        return imageRepo.save(img);
    }

    // GET IMAGES
    public List<TicketImage> getImages(String ticketId) {
        return imageRepo.findByTicketId(ticketId);
    }
}
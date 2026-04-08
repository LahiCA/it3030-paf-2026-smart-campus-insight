package com.smartcampus.backend.tickets.service;

import com.smartcampus.backend.tickets.model.*;
import com.smartcampus.backend.tickets.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.io.File;

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

        if (ticket.getContactDetails() == null || ticket.getContactDetails().isEmpty()) {
            ticket.setContactDetails("N/A");
        }

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
    public Ticket updateStatus(String id, String newStatus) {

        Ticket ticket = getTicketById(id);
        String currentStatus = ticket.getStatus();

        if ("OPEN".equals(currentStatus) && "IN_PROGRESS".equals(newStatus)) {

        } else if ("IN_PROGRESS".equals(currentStatus) && "RESOLVED".equals(newStatus)) {

        } else if ("RESOLVED".equals(currentStatus) && "CLOSED".equals(newStatus)) {

        } else {
            throw new RuntimeException("Invalid status transition from "
                    + currentStatus + " to " + newStatus);
        }

        ticket.setStatus(newStatus);
        return ticketRepo.save(ticket);
    }

    // ASSIGN TECHNICIAN
    public Ticket assignTechnician(String ticketId, String techId) {
        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket with ID " + ticketId + " not found"));

        ticket.setAssignedTo(techId);
        ticket.setStatus("IN_PROGRESS");
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

    // Edit comment
    public Comment updateComment(String commentId, String userId, String newMessage) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setMessage(newMessage);
        return commentRepo.save(comment);
    }

    // Delete comment
    public void deleteComment(String commentId, String userId) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        commentRepo.delete(comment);
    }

    // Delete ticket
    public void deleteTicket(String ticketId) {
        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        // Optional: delete related comments and images
        List<Comment> comments = commentRepo.findByTicketId(ticketId);
        commentRepo.deleteAll(comments);

        List<TicketImage> images = imageRepo.findByTicketId(ticketId);
        imageRepo.deleteAll(images);

        ticketRepo.delete(ticket);
    }

    // Delete image
    public void deleteImage(String imageId) {
        TicketImage img = imageRepo.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        // Remove file from local storage
        File file = new File(img.getImagePath());
        if (file.exists()) {
            file.delete();
        }

        imageRepo.delete(img);
    }

    // Resolve ticket
    public Ticket resolveTicket(String id, String note) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus("RESOLVED");
        ticket.setResolutionNote(note);
        return ticketRepo.save(ticket);
    }

    public Ticket rejectTicket(String id, String reason) {
        Ticket ticket = getTicketById(id);

        // Optional: only allow reject from OPEN state
        if (!ticket.getStatus().equals("OPEN")) {
            throw new RuntimeException("Only OPEN tickets can be rejected");
        }

        ticket.setStatus("REJECTED");
        ticket.setRejectionReason(reason);

        return ticketRepo.save(ticket);
    }

}
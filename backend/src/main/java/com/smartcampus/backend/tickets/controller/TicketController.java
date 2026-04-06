package com.smartcampus.backend.tickets.controller;

import com.smartcampus.backend.tickets.model.*;
import com.smartcampus.backend.tickets.service.TicketService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin
public class TicketController {

    private final TicketService service;

    public TicketController(TicketService service) {
        this.service = service;
    }

    // CREATE TICKET
    @PostMapping
    public Ticket create(@RequestBody Ticket ticket) {
        return service.createTicket(ticket);
    }

    // GET ALL
    @GetMapping
    public List<Ticket> getAll() {
        return service.getAllTickets();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Ticket getById(@PathVariable String id) {
        return service.getTicketById(id);
    }

    // UPDATE STATUS
    @PutMapping("/{id}/status")
    public Ticket updateStatus(@PathVariable String id,
            @RequestParam String status) {
        return service.updateStatus(id, status);
    }

    // ASSIGN TECHNICIAN
    @PutMapping("/{id}/assign")
    public Ticket assign(@PathVariable String id,
            @RequestParam String techId) {
        return service.assignTechnician(id, techId);
    }

    // ADD COMMENT
    @PostMapping("/{id}/comments")
    public Comment addComment(@PathVariable String id,
            @RequestBody Comment comment) {
        comment.setTicketId(id);
        return service.addComment(comment);
    }

    // GET COMMENTS
    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable String id) {
        return service.getComments(id);
    }

    // GET IMAGES
    @GetMapping("/{id}/images")
    public List<TicketImage> getImages(@PathVariable String id) {
        return service.getImages(id);
    }
}
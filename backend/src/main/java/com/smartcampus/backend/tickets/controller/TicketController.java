package com.smartcampus.backend.tickets.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.backend.tickets.dto.AssignTechnicianRequest;
import com.smartcampus.backend.tickets.dto.CommentCreateRequest;
import com.smartcampus.backend.tickets.dto.CommentUpdateRequest;
import com.smartcampus.backend.tickets.dto.RateTicketRequest;
import com.smartcampus.backend.tickets.dto.StatusUpdateRequest;
import com.smartcampus.backend.tickets.dto.TicketCreateRequest;
import com.smartcampus.backend.tickets.dto.TicketUpdateRequest;
import com.smartcampus.backend.tickets.model.Comment;
import com.smartcampus.backend.tickets.model.Ticket;
import com.smartcampus.backend.tickets.model.TicketImage;
import com.smartcampus.backend.tickets.service.TicketService;

import jakarta.validation.Valid;

@RestController
@Validated
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody TicketCreateRequest request) {
        return ResponseEntity.status(201).body(ticketService.createTicket(request));
    }

    @GetMapping
    public List<Ticket> getAllTickets(@RequestHeader(name = "role", defaultValue = "USER") String role) {
        return ticketService.getAllTickets(role);
    }

    @GetMapping("/{id}")
    public Ticket getTicketById(@PathVariable String id) {
        return ticketService.getTicketById(id);
    }

    @GetMapping("/user/{userId}")
    public List<Ticket> getTicketsByUserId(@PathVariable String userId) {
        return ticketService.getTicketsByUserId(userId);
    }

    @GetMapping("/assigned/{assignedTo}")
    public List<Ticket> getAssignedTickets(
            @PathVariable String assignedTo,
            @RequestHeader(name = "role", defaultValue = "USER") String role,
            @RequestHeader(name = "displayId", defaultValue = "") String displayId) {
        return ticketService.getTicketsAssignedTo(assignedTo, role, displayId);
    }

    @PutMapping("/{id}")
    public Ticket updateTicket(
            @PathVariable String id,
            @Valid @RequestBody TicketUpdateRequest request,
            @RequestHeader(name = "userId", defaultValue = "") String userId,
            @RequestHeader(name = "role", defaultValue = "USER") String role) {
        return ticketService.updateTicket(id, request, userId, role);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(
            @PathVariable String id,
            @RequestHeader(name = "role", defaultValue = "USER") String role) {
        ticketService.deleteTicket(id, role);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/status")
    public Ticket updateStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusUpdateRequest request,
            @RequestHeader(name = "role", defaultValue = "USER") String role,
            @RequestHeader(name = "displayId", defaultValue = "") String displayId) {
        return ticketService.updateStatus(id, request, role, displayId);
    }

    @PutMapping("/{id}/assign")
    public Ticket assignTechnician(
            @PathVariable String id,
            @Valid @RequestBody AssignTechnicianRequest request,
            @RequestHeader(name = "role", defaultValue = "USER") String role) {
        return ticketService.assignTechnician(id, request, role);
    }

    @PutMapping("/{id}/rate")
    public Ticket rateTicket(
            @PathVariable String id,
            @Valid @RequestBody RateTicketRequest request,
            @RequestHeader(name = "userId", defaultValue = "") String userId,
            @RequestHeader(name = "displayId", defaultValue = "") String displayId,
            @RequestHeader(name = "role", defaultValue = "USER") String role) {
        return ticketService.rateTicket(id, request, userId, displayId, role);
    }

    @PostMapping("/{id}/upload")
    public List<TicketImage> uploadImages(
            @PathVariable String id,
            @RequestParam("files") MultipartFile[] files) {
        return ticketService.uploadImages(id, files);
    }

    @GetMapping("/{id}/images")
    public List<TicketImage> getImages(@PathVariable String id) {
        return ticketService.getImages(id);
    }

    @GetMapping("/attachments/{imageId}")
    public ResponseEntity<Resource> viewAttachment(@PathVariable String imageId) {
        Resource resource = ticketService.loadImageAsResource(imageId);
        MediaType mediaType = ticketService.getImageMediaType(imageId);
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CACHE_CONTROL, "no-cache")
                .body(resource);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentCreateRequest request) {
        return ResponseEntity.status(201).body(ticketService.addComment(id, request));
    }

    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable String id) {
        return ticketService.getComments(id);
    }

    @PutMapping("/comments/{commentId}")
    public Comment updateComment(
            @PathVariable String commentId,
            @Valid @RequestBody CommentUpdateRequest request) {
        return ticketService.updateComment(commentId, request);
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String commentId,
            @RequestHeader(name = "userId", defaultValue = "") String userId) {
        ticketService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}

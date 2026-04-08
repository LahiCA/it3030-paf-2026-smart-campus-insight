package com.smartcampus.backend.tickets.controller;

import com.smartcampus.backend.tickets.model.*;
import com.smartcampus.backend.tickets.service.TicketService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.UUID;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173") // allow your frontend origin

public class TicketController {

    private final TicketService service;

    public TicketController(TicketService service) {
        this.service = service;
    }

    // CREATE TICKET

    @PostMapping
    public Ticket create(@Valid @RequestBody Ticket ticket) {
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

    @PutMapping("/{id}/resolve")
    public Ticket resolveTicket(@PathVariable String id,
            @RequestParam String note) {
        return service.resolveTicket(id, note);
    }

    // REJECT TICKET
    @PutMapping("/{id}/reject")
    public Ticket rejectTicket(@PathVariable String id,
            @RequestParam String reason,
            @RequestHeader("role") String role) {

        if (!role.equals("ADMIN")) {
            throw new RuntimeException("Only ADMIN can reject tickets");
        }

        return service.rejectTicket(id, reason);
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

    // UPLOAD IMAGES
    @PostMapping("/{id}/upload")
    public String uploadImages(@PathVariable String id,
            @RequestParam("files") MultipartFile[] files) throws IOException {

        if (files.length > 3) {
            return "Max 3 images allowed!";
        }

        String uploadDir = System.getProperty("user.dir") + "/uploads/";
        File dir = new File(uploadDir);
        if (!dir.exists())
            dir.mkdirs();

        for (MultipartFile file : files) {
            if (file.isEmpty())
                continue;

            // Check MIME type
            String contentType = file.getContentType();
            if (!contentType.startsWith("image/")) {
                throw new RuntimeException("Only image files are allowed!");
            }

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            File dest = new File(uploadDir + fileName);

            try {
                file.transferTo(dest);

                TicketImage img = new TicketImage();
                img.setTicketId(id);
                img.setImagePath(dest.getPath());

                service.saveImage(img);

            } catch (IOException ex) {
                // Rollback uploaded files for this request
                if (dest.exists())
                    dest.delete();
                throw new RuntimeException("Failed to upload image: " + ex.getMessage());
            }
        }

        return "Images uploaded successfully";
    }

    // ROLE SIMULATION
    @PutMapping("/{id}/assign")
    public Ticket assign(@PathVariable String id,
            @RequestParam String techId,
            @RequestHeader("role") String role) {

        if (!role.equals("ADMIN")) {
            throw new RuntimeException("Only ADMIN can assign technician");
        }

        return service.assignTechnician(id, techId);
    }

    @GetMapping("/test-role")
    public String testRole(@RequestHeader("role") String role) {
        if (role.equals("ADMIN")) {
            return "Welcome, Admin!";
        } else if (role.equals("USER")) {
            return "Hello, User!";
        } else {
            return "Unknown role!";
        }
    }

    // EDIT COMMENT
    @PutMapping("/comments/{commentId}")
    public Comment editComment(
            @PathVariable String commentId,
            @RequestHeader("userId") String userId,
            @RequestParam String message) {

        return service.updateComment(commentId, userId, message);
    }

    // DELETE COMMENT only to creator
    @DeleteMapping("/comments/{commentId}")
    public String deleteComment(
            @PathVariable String commentId,
            @RequestHeader("userId") String userId) {

        service.deleteComment(commentId, userId);
        return "Comment deleted successfully";
    }

    // DELETE TICKET
    @DeleteMapping("/{id}")
    public String deleteTicket(@PathVariable String id, @RequestHeader("role") String role) {
        if (!role.equals("ADMIN")) {
            throw new RuntimeException("Only ADMIN can delete tickets");
        }
        service.deleteTicket(id);
        return "Ticket deleted successfully";
    }

    // DELETE IMAGE
    @DeleteMapping("/images/{imageId}")
    public String deleteImage(@PathVariable String imageId, @RequestHeader("role") String role) {
        if (!role.equals("ADMIN")) {
            throw new RuntimeException("Only ADMIN can delete images");
        }
        service.deleteImage(imageId);
        return "Image deleted successfully";
    }

}
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
@CrossOrigin
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

    // ASSIGN TECHNICIAN

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
            dir.mkdirs(); // create folder

        for (MultipartFile file : files) {
            if (file.isEmpty())
                continue;

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            File dest = new File(uploadDir + fileName);

            file.transferTo(dest);

            TicketImage img = new TicketImage();
            img.setTicketId(id);
            img.setImagePath(dest.getPath());

            service.saveImage(img); // save to Mongo
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
}
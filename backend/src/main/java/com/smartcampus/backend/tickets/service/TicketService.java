package com.smartcampus.backend.tickets.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.backend.tickets.dto.AssignTechnicianRequest;
import com.smartcampus.backend.tickets.dto.CommentCreateRequest;
import com.smartcampus.backend.tickets.dto.CommentUpdateRequest;
import com.smartcampus.backend.tickets.dto.StatusUpdateRequest;
import com.smartcampus.backend.tickets.dto.TicketCreateRequest;
import com.smartcampus.backend.tickets.dto.TicketUpdateRequest;
import com.smartcampus.backend.tickets.model.Comment;
import com.smartcampus.backend.tickets.model.Ticket;
import com.smartcampus.backend.tickets.model.TicketImage;
import com.smartcampus.backend.tickets.repository.CommentRepository;
import com.smartcampus.backend.tickets.repository.TicketImageRepository;
import com.smartcampus.backend.tickets.repository.TicketRepository;

@Service
public class TicketService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_TECHNICIAN = "TECHNICIAN";
    private static final String STATUS_OPEN = "OPEN";
    private static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    private static final String STATUS_RESOLVED = "RESOLVED";
    private static final String STATUS_CLOSED = "CLOSED";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final int MAX_ATTACHMENTS = 3;
    private static final long MAX_IMAGE_SIZE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> STATUS_MANAGERS = Set.of(ROLE_ADMIN, ROLE_TECHNICIAN);

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final TicketImageRepository ticketImageRepository;
    private final Path uploadDirectory = Paths.get(System.getProperty("user.dir"), "uploads");

    public TicketService(
            TicketRepository ticketRepository,
            CommentRepository commentRepository,
            TicketImageRepository ticketImageRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.ticketImageRepository = ticketImageRepository;
    }

    public Ticket createTicket(TicketCreateRequest request) {
        LocalDateTime now = LocalDateTime.now();
        Ticket ticket = Ticket.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .category(request.getCategory().trim())
                .priority(request.getPriority().trim().toUpperCase())
                .status(STATUS_OPEN)
                .userId(request.getUserId().trim())
                .userDisplayId(request.getUserDisplayId().trim())
                .contactNumber(request.getContactNumber().trim())
                .createdAt(now)
                .updatedAt(now)
                .build();

        return hydrate(ticketRepository.save(ticket));
    }

    public List<Ticket> getAllTickets(String requesterRole) {
        requireRole(requesterRole, ROLE_ADMIN);
        return ticketRepository.findAll().stream()
                .sorted(Comparator.comparing(Ticket::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::hydrate)
                .toList();
    }

    public Ticket getTicketById(String id) {
        return hydrate(findTicket(id));
    }

    public List<Ticket> getTicketsByUserId(String userId) {
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::hydrate)
                .toList();
    }

    public List<Ticket> getTicketsAssignedTo(String assignedTo, String requesterRole, String requesterDisplayId) {
        requireAnyRole(requesterRole, Set.of(ROLE_ADMIN, ROLE_TECHNICIAN));
        String normalizedRequesterRole = normalize(requesterRole);
        String normalizedAssignedTo = assignedTo == null ? "" : assignedTo.trim();
        String normalizedRequesterDisplayId = requesterDisplayId == null ? "" : requesterDisplayId.trim();

        if (ROLE_TECHNICIAN.equals(normalizedRequesterRole)
                && !normalizedAssignedTo.equalsIgnoreCase(normalizedRequesterDisplayId)) {
            throw new RuntimeException("Technicians can only view tickets assigned to themselves");
        }

        return ticketRepository.findByAssignedToOrderByCreatedAtDesc(normalizedAssignedTo).stream()
                .map(this::hydrate)
                .toList();
    }

    public Ticket updateTicket(String id, TicketUpdateRequest request, String requesterUserId, String requesterRole) {
        Ticket ticket = findTicket(id);
        if (!ROLE_ADMIN.equals(normalize(requesterRole)) && !Objects.equals(ticket.getUserId(), requesterUserId)) {
            throw new RuntimeException("Only the ticket owner or ADMIN can update this ticket");
        }
        if (!STATUS_OPEN.equals(ticket.getStatus()) && !STATUS_IN_PROGRESS.equals(ticket.getStatus())) {
            throw new RuntimeException("Only OPEN or IN_PROGRESS tickets can be updated");
        }

        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setCategory(request.getCategory().trim());
        ticket.setPriority(request.getPriority().trim().toUpperCase());
        ticket.setContactNumber(request.getContactNumber().trim());
        ticket.setUpdatedAt(LocalDateTime.now());

        return hydrate(ticketRepository.save(ticket));
    }

    public void deleteTicket(String id, String requesterRole) {
        requireRole(requesterRole, ROLE_ADMIN);
        Ticket ticket = findTicket(id);
        List<TicketImage> images = ticketImageRepository.findByTicketId(id);
        for (TicketImage image : images) {
            deleteStoredFile(image.getFilePath());
        }
        ticketImageRepository.deleteAll(images);
        commentRepository.deleteAll(commentRepository.findByTicketId(id));
        ticketRepository.delete(ticket);
    }

    public Ticket updateStatus(String id, StatusUpdateRequest request, String requesterRole,
            String requesterDisplayId) {
        requireAnyRole(requesterRole, STATUS_MANAGERS);
        Ticket ticket = findTicket(id);
        String nextStatus = normalize(request.getStatus());
        String normalizedRequesterRole = normalize(requesterRole);

        if (ROLE_TECHNICIAN.equals(normalizedRequesterRole)) {
            if (!StringUtils.hasText(ticket.getAssignedTo()) || !ticket.getAssignedTo().trim()
                    .equalsIgnoreCase(requesterDisplayId == null ? "" : requesterDisplayId.trim())) {
                throw new RuntimeException("Technicians can only update tickets assigned to them");
            }
            if (STATUS_REJECTED.equals(nextStatus)) {
                throw new RuntimeException("Only ADMIN can reject a ticket");
            }
        }

        validateTransition(ticket.getStatus(), nextStatus);

        if (STATUS_RESOLVED.equals(nextStatus) && !StringUtils.hasText(request.getResolutionNotes())) {
            throw new RuntimeException("Resolution notes are required when resolving a ticket");
        }
        if (STATUS_REJECTED.equals(nextStatus) && !StringUtils.hasText(request.getRejectionReason())) {
            throw new RuntimeException("Rejection reason is required when rejecting a ticket");
        }

        LocalDateTime now = LocalDateTime.now();
        if (STATUS_IN_PROGRESS.equals(nextStatus) && ticket.getFirstResponseAt() == null) {
            ticket.setFirstResponseAt(now);
        }
        if (STATUS_RESOLVED.equals(nextStatus) && ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(now);
        }

        ticket.setStatus(nextStatus);
        if (StringUtils.hasText(request.getResolutionNotes())) {
            ticket.setResolutionNotes(request.getResolutionNotes().trim());
        }
        if (StringUtils.hasText(request.getRejectionReason())) {
            ticket.setRejectionReason(request.getRejectionReason().trim());
        }
        if (STATUS_REJECTED.equals(nextStatus)) {
            ticket.setAssignedTo(null);
            ticket.setResolutionNotes(null);
        }
        ticket.setUpdatedAt(now);

        return hydrate(ticketRepository.save(ticket));
    }

    public Ticket assignTechnician(String id, AssignTechnicianRequest request, String requesterRole) {
        requireRole(requesterRole, ROLE_ADMIN);
        Ticket ticket = findTicket(id);
        if (STATUS_CLOSED.equals(ticket.getStatus()) || STATUS_REJECTED.equals(ticket.getStatus())) {
            throw new RuntimeException("Closed or rejected tickets cannot be assigned");
        }

        ticket.setAssignedTo(request.getAssignedTo().trim());
        ticket.setUpdatedAt(LocalDateTime.now());

        if (STATUS_OPEN.equals(ticket.getStatus())) {
            ticket.setStatus(STATUS_IN_PROGRESS);
            if (ticket.getFirstResponseAt() == null) {
                ticket.setFirstResponseAt(LocalDateTime.now());
            }
        }

        return hydrate(ticketRepository.save(ticket));
    }

    public List<TicketImage> uploadImages(String ticketId, MultipartFile[] files) {
        Ticket ticket = findTicket(ticketId);
        if (files == null || files.length == 0) {
            throw new RuntimeException("At least one image is required");
        }

        List<TicketImage> existingImages = ticketImageRepository.findByTicketIdOrderByUploadedAtAsc(ticketId);
        if (existingImages.size() + files.length > MAX_ATTACHMENTS) {
            throw new RuntimeException("A ticket can have at most 3 image attachments");
        }

        try {
            Files.createDirectories(uploadDirectory);
            for (MultipartFile file : files) {
                validateImage(file);
            }

            LocalDateTime now = LocalDateTime.now();
            for (MultipartFile file : files) {
                String originalName = Objects.requireNonNullElse(file.getOriginalFilename(), "attachment");
                String safeFileName = UUID.randomUUID() + "_" + StringUtils.cleanPath(originalName);
                Path target = uploadDirectory.resolve(safeFileName).normalize();
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

                TicketImage image = TicketImage.builder()
                        .ticketId(ticketId)
                        .fileName(safeFileName)
                        .filePath(target.toString())
                        .contentType(file.getContentType())
                        .uploadedAt(now)
                        .build();
                ticketImageRepository.save(image);
            }

            ticket.setUpdatedAt(now);
            ticketRepository.save(ticket);
            return ticketImageRepository.findByTicketIdOrderByUploadedAtAsc(ticketId);
        } catch (IOException exception) {
            throw new RuntimeException("Failed to upload ticket images", exception);
        }
    }

    public List<Comment> getComments(String ticketId) {
        findTicket(ticketId);
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public Comment addComment(String ticketId, CommentCreateRequest request) {
        findTicket(ticketId);
        LocalDateTime now = LocalDateTime.now();
        Comment comment = Comment.builder()
                .ticketId(ticketId)
                .userId(request.getUserId().trim())
                .userDisplayId(
                        StringUtils.hasText(request.getUserDisplayId()) ? request.getUserDisplayId().trim() : null)
                .message(request.getMessage().trim())
                .createdAt(now)
                .updatedAt(now)
                .build();

        Comment savedComment = commentRepository.save(comment);
        touchTicket(ticketId);
        return savedComment;
    }

    public Comment updateComment(String commentId, CommentUpdateRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!Objects.equals(comment.getUserId(), request.getUserId().trim())) {
            throw new RuntimeException("Only the comment owner can edit this comment");
        }

        comment.setMessage(request.getMessage().trim());
        comment.setUpdatedAt(LocalDateTime.now());
        Comment savedComment = commentRepository.save(comment);
        touchTicket(comment.getTicketId());
        return savedComment;
    }

    public void deleteComment(String commentId, String requesterUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!Objects.equals(comment.getUserId(), requesterUserId)) {
            throw new RuntimeException("Only the comment owner can delete this comment");
        }

        commentRepository.delete(comment);
        touchTicket(comment.getTicketId());
    }

    public List<TicketImage> getImages(String ticketId) {
        findTicket(ticketId);
        return ticketImageRepository.findByTicketIdOrderByUploadedAtAsc(ticketId);
    }

    public TicketImage getImageMetadata(String imageId) {
        return ticketImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    public Resource loadImageAsResource(String imageId) {
        try {
            TicketImage image = getImageMetadata(imageId);
            Path path = Paths.get(image.getFilePath());
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("Attachment file is not available");
            }
            return resource;
        } catch (IOException exception) {
            throw new RuntimeException("Failed to read attachment", exception);
        }
    }

    public MediaType getImageMediaType(String imageId) {
        TicketImage image = getImageMetadata(imageId);
        String contentType = image.getContentType() == null ? MediaType.IMAGE_JPEG_VALUE : image.getContentType();
        return MediaType.parseMediaType(contentType);
    }

    private Ticket findTicket(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    private Ticket hydrate(Ticket ticket) {
        ticket.setAttachments(ticketImageRepository.findByTicketIdOrderByUploadedAtAsc(ticket.getId()));
        ticket.setComments(commentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId()));
        return ticket;
    }

    private void validateTransition(String currentStatus, String nextStatus) {
        String normalizedCurrent = normalize(currentStatus);
        if (STATUS_REJECTED.equals(normalizedCurrent) || STATUS_CLOSED.equals(normalizedCurrent)) {
            throw new RuntimeException("Closed or rejected tickets cannot change status");
        }

        boolean valid = switch (normalizedCurrent) {
            case STATUS_OPEN -> STATUS_IN_PROGRESS.equals(nextStatus) || STATUS_REJECTED.equals(nextStatus);
            case STATUS_IN_PROGRESS -> STATUS_RESOLVED.equals(nextStatus) || STATUS_REJECTED.equals(nextStatus);
            case STATUS_RESOLVED -> STATUS_CLOSED.equals(nextStatus);
            default -> false;
        };

        if (!valid) {
            throw new RuntimeException("Invalid status transition from " + normalizedCurrent + " to " + nextStatus);
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Uploaded image cannot be empty");
        }
        String contentType = file.getContentType();
        if (contentType == null || (!MediaType.IMAGE_JPEG_VALUE.equals(contentType)
                && !MediaType.IMAGE_PNG_VALUE.equals(contentType))) {
            throw new RuntimeException("Only JPG and PNG image files are allowed");
        }
        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new RuntimeException("Each image must be 5MB or smaller");
        }
    }

    private void requireRole(String actualRole, String expectedRole) {
        if (!expectedRole.equals(normalize(actualRole))) {
            throw new RuntimeException("Access denied for role: " + normalize(actualRole));
        }
    }

    private void requireAnyRole(String actualRole, Set<String> allowedRoles) {
        String normalizedRole = normalize(actualRole);
        if (!allowedRoles.contains(normalizedRole)) {
            throw new RuntimeException("Access denied for role: " + normalizedRole);
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase();
    }

    private void touchTicket(String ticketId) {
        Ticket ticket = findTicket(ticketId);
        ticket.setUpdatedAt(LocalDateTime.now());
        ticketRepository.save(ticket);
    }

    private void deleteStoredFile(String filePath) {
        try {
            if (StringUtils.hasText(filePath)) {
                Files.deleteIfExists(Paths.get(filePath));
            }
        } catch (IOException exception) {
            throw new RuntimeException("Failed to delete attachment file", exception);
        }
    }
}

package com.smartcampus.backend.controller;

import com.smartcampus.backend.entities.Resource.ResourceStatus;
import com.smartcampus.backend.entities.Resource.ResourceType;
import com.smartcampus.backend.entities.Resource;
import com.smartcampus.backend.service.ResourceService;
import com.smartcampus.backend.util.FileUploadUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * REST Controller for managing resources in the Smart Campus system.
 * Handles CRUD operations, filtering, status updates, and file uploads.
 */
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    // Service layer for handling business logic related to resources
    private final ResourceService resourceService;

    // Utility class for handling file uploads (images)
    private final FileUploadUtil fileUploadUtil;

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer capacityMin) {

        // Initialize enum variables
        ResourceStatus statusEnum = null;
        ResourceType typeEnum = null;

        try {
            // Convert status string to enum (case-insensitive)
            if (status != null && !status.isBlank()) {
                statusEnum = Arrays.stream(ResourceStatus.values())
                        .filter(s -> s.name().equalsIgnoreCase(status))
                        .findFirst()
                        .orElse(null);
            }

            // Convert type string to enum (case-insensitive)
            if (type != null && !type.isBlank()) {
                typeEnum = Arrays.stream(ResourceType.values())
                        .filter(t -> t.name().equalsIgnoreCase(type))
                        .findFirst()
                        .orElse(null);
            }

        } catch (IllegalArgumentException e) {
            // Return 400 Bad Request if invalid enum value is provided
            return ResponseEntity.badRequest().build();
        }

        // Call service method to filter resources and return result
        return ResponseEntity.ok(
                resourceService.filterResources(statusEnum, typeEnum, search, location, capacityMin));
    }

    // Get a single resource by its ID

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // Create a new resource with optional image upload

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Resource> createResource(
            @Valid @ModelAttribute Resource resource,
            @RequestParam(value = "images", required = false) MultipartFile[] images) throws IOException {

        // Check if image is provided and not empty
        if (images != null && images.length > 0 && !images[0].isEmpty()) {

            // Save file and get stored filename
            String fileName = fileUploadUtil.saveFile("resources", images[0]);

            // Set image URL in resource object
            resource.setImageUrl("/uploads/resources/" + fileName);
        }

        // Save resource via service layer
        return ResponseEntity.status(201).body(resourceService.createResource(resource));
    }

    // Update an existing resource

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Resource> updateResource(
            @PathVariable String id,
            @Valid @ModelAttribute Resource resource,
            @RequestParam(value = "images", required = false) MultipartFile[] images) throws IOException {

        // Check if new image is provided
        if (images != null && images.length > 0 && !images[0].isEmpty()) {

            // Save new image
            String fileName = fileUploadUtil.saveFile("resources", images[0]);

            // Update image URL
            resource.setImageUrl("/uploads/resources/" + fileName);
        }

        // Update resource using service layer
        return ResponseEntity.ok(resourceService.updateResource(id, resource));
    }

    // Update only the status of a resource

    @PatchMapping("/{id}/status")
    public ResponseEntity<Resource> updateStatus(
            @PathVariable String id,
            @RequestParam ResourceStatus status) {

        // Call service to update only the status field
        return ResponseEntity.ok(resourceService.updateStatus(id, status));
    }

    // Upload or replace resource image separately

    @PostMapping("/{id}/image")
    public ResponseEntity<Resource> uploadImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws IOException {

        // Save uploaded image file
        String fileName = fileUploadUtil.saveFile("resources", file);

        // Retrieve existing resource
        Resource resource = resourceService.getResourceById(id);

        // Update image URL
        resource.setImageUrl("/uploads/resources/" + fileName);

        // Save updated resource
        return ResponseEntity.ok(resourceService.updateResource(id, resource));
    }

    // Delete a resource by ID

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {

        // Call service to delete resource
        resourceService.deleteResource(id);

        // Return 204 No Content after successful deletion
        return ResponseEntity.noContent().build();
    }
}
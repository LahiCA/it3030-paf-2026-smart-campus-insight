package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.dto.ResourceRequestDTO;
import com.smartcampus.backend.enums.ResourceStatus;
import com.smartcampus.backend.enums.ResourceType;
import com.smartcampus.backend.services.ResourceService;
//import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
//import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceController {

    private final ResourceService resourceService;

    // GET /api/resources?type=LAB&location=Block+B&minCapacity=20&status=ACTIVE
    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) ResourceStatus status) {

        return ResponseEntity.ok(
                resourceService.getAllResources(type, location, minCapacity, status));
    }

    // GET /api/resources/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // POST /api/resources — ADMIN only
    @PostMapping(consumes = {"multipart/form-data"})
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> createResource(
            @RequestParam("name") String name,
            @RequestParam("type") ResourceType type,
            @RequestParam("location") String location,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "capacity", required = false) Integer capacity,
            @RequestParam(value = "availableFrom", required = false) String availableFrom,
            @RequestParam(value = "availableTo", required = false) String availableTo,
            @RequestParam(value = "status", required = false) ResourceStatus status,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {

        ResourceRequestDTO dto = new ResourceRequestDTO();
        dto.setName(name);
        dto.setType(type);
        dto.setLocation(location);
        dto.setDescription(description);
        dto.setCapacity(capacity);
        // Parse time strings if provided
        if (availableFrom != null && !availableFrom.isEmpty()) {
            dto.setAvailableFrom(java.time.LocalTime.parse(availableFrom));
        }
        if (availableTo != null && !availableTo.isEmpty()) {
            dto.setAvailableTo(java.time.LocalTime.parse(availableTo));
        }
        dto.setStatus(status);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(resourceService.createResource(dto, images));
    }

    // PUT /api/resources/{id} — ADMIN only
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> updateResource(
            @PathVariable String id,
            @RequestParam("name") String name,
            @RequestParam("type") ResourceType type,
            @RequestParam("location") String location,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "capacity", required = false) Integer capacity,
            @RequestParam(value = "availableFrom", required = false) String availableFrom,
            @RequestParam(value = "availableTo", required = false) String availableTo,
            @RequestParam(value = "status", required = false) ResourceStatus status,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {

        ResourceRequestDTO dto = new ResourceRequestDTO();
        dto.setName(name);
        dto.setType(type);
        dto.setLocation(location);
        dto.setDescription(description);
        dto.setCapacity(capacity);
        // Parse time strings if provided
        if (availableFrom != null && !availableFrom.isEmpty()) {
            dto.setAvailableFrom(java.time.LocalTime.parse(availableFrom));
        }
        if (availableTo != null && !availableTo.isEmpty()) {
            dto.setAvailableTo(java.time.LocalTime.parse(availableTo));
        }
        dto.setStatus(status);

        return ResponseEntity.ok(resourceService.updateResource(id, dto, images));
    }

    // PATCH /api/resources/{id}/status — ADMIN only
    @PatchMapping("/{id}/status")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> updateStatus(
            @PathVariable String id,
            @RequestParam ResourceStatus status) {

        return ResponseEntity.ok(resourceService.updateStatus(id, status));
    }

    // DELETE /api/resources/{id} — ADMIN only
    @DeleteMapping("/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
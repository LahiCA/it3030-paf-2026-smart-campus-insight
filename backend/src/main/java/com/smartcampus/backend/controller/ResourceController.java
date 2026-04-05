package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.dto.ResourceRequestDTO;
import com.smartcampus.backend.enums.ResourceStatus;
import com.smartcampus.backend.enums.ResourceType;
import com.smartcampus.backend.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
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
    public ResponseEntity<ResourceDTO> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // POST /api/resources  — ADMIN only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> createResource(
            @Valid @RequestBody ResourceRequestDTO dto) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(resourceService.createResource(dto));
    }

    // PUT /api/resources/{id}  — ADMIN only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequestDTO dto) {

        return ResponseEntity.ok(resourceService.updateResource(id, dto));
    }

    // PATCH /api/resources/{id}/status?status=OUT_OF_SERVICE  — ADMIN only
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam ResourceStatus status) {

        return ResponseEntity.ok(resourceService.updateStatus(id, status));
    }

    // DELETE /api/resources/{id}  — ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}

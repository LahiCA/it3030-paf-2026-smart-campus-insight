package com.smartcampus.backend.controller;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.Resource.ResourceStatus;
import com.smartcampus.backend.model.Resource.ResourceType;
import com.smartcampus.backend.services.ResourceService;
import com.smartcampus.backend.utils.FileUploadUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ResourceController {

    private final ResourceService resourceService;
    private final FileUploadUtil fileUploadUtil;

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) String search) {

        // 🔍 Search
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(resourceService.searchResources(search));
        }

        // ✅ Correct combined filtering
        if (status != null && type != null) {
            return ResponseEntity.ok(
                    resourceService.getResourcesByStatusAndType(status, type)
            );
        }

        if (status != null) {
            return ResponseEntity.ok(
                    resourceService.getAvailableResources()
            );
        }

        if (type != null) {
            return ResponseEntity.ok(
                    resourceService.getResourcesByType(type)
            );
        }

        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Resource> createResource(
            @Valid @ModelAttribute Resource resource,
            @RequestParam(value = "images", required = false) MultipartFile[] images) throws IOException {

        if (images != null && images.length > 0 && !images[0].isEmpty()) {
            String fileName = fileUploadUtil.saveFile("resources", images[0]);
            resource.setImageUrl("/uploads/resources/" + fileName);
        }

        return ResponseEntity.status(201).body(resourceService.createResource(resource));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Resource> updateResource(
            @PathVariable String id,
            @Valid @ModelAttribute Resource resource,
            @RequestParam(value = "images", required = false) MultipartFile[] images) throws IOException {

        if (images != null && images.length > 0 && !images[0].isEmpty()) {
            String fileName = fileUploadUtil.saveFile("resources", images[0]);
            resource.setImageUrl("/uploads/resources/" + fileName);
        }

        return ResponseEntity.ok(resourceService.updateResource(id, resource));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Resource> updateStatus(
            @PathVariable String id,
            @RequestParam ResourceStatus status) {
        return ResponseEntity.ok(resourceService.updateStatus(id, status));
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<Resource> uploadImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws IOException {

        String fileName = fileUploadUtil.saveFile("resources", file);

        Resource resource = resourceService.getResourceById(id);
        resource.setImageUrl("/uploads/resources/" + fileName);

        return ResponseEntity.ok(resourceService.updateResource(id, resource));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
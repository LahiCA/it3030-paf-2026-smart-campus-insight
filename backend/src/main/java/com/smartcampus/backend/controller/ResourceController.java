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

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;
    private final FileUploadUtil fileUploadUtil;

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer capacityMin) {

        ResourceStatus statusEnum = null;
        ResourceType typeEnum = null;

        try {
            if (status != null && !status.isBlank()) {
                statusEnum = Arrays.stream(ResourceStatus.values())
                    .filter(s -> s.name().equalsIgnoreCase(status))
                    .findFirst()
                    .orElse(null);
            }

            if (type != null && !type.isBlank()) {
                typeEnum = Arrays.stream(ResourceType.values())
                    .filter(t -> t.name().equalsIgnoreCase(type))
                    .findFirst()
                    .orElse(null);
}
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build(); // invalid enum value
        }

        return ResponseEntity.ok(
                resourceService.filterResources(statusEnum, typeEnum, search, location, capacityMin)
        );
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
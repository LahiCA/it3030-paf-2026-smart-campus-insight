package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.request.ResourceRequest;
import com.smartcampus.backend.dto.response.ResourceDTO;
import com.smartcampus.backend.entities.Resource;
import com.smartcampus.backend.enums.ResourceType;
import com.smartcampus.backend.repository.ResourceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    public List<ResourceDTO> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public ResourceDTO getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
        return toDTO(resource);
    }

    public List<ResourceDTO> getResourcesByType(ResourceType type) {
        return resourceRepository.findByType(type).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<ResourceDTO> searchResources(String query) {
        return resourceRepository.findByNameContainingIgnoreCase(query).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResourceDTO createResource(ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .status(request.getStatus())
                .description(request.getDescription())
                .build();

        Resource saved = resourceRepository.save(resource);
        log.info("Created resource: {} ({})", saved.getName(), saved.getId());
        return toDTO(saved);
    }

    @Transactional
    public ResourceDTO updateResource(String id, ResourceRequest request) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));

        resource.setName(request.getName());
        resource.setType(request.getType());
        resource.setLocation(request.getLocation());
        resource.setCapacity(request.getCapacity());
        resource.setStatus(request.getStatus());
        resource.setDescription(request.getDescription());

        Resource updated = resourceRepository.save(resource);
        log.info("Updated resource: {} ({})", updated.getName(), updated.getId());
        return toDTO(updated);
    }

    @Transactional
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new RuntimeException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
        log.info("Deleted resource: {}", id);
    }

    private ResourceDTO toDTO(Resource resource) {
        return ResourceDTO.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .location(resource.getLocation())
                .capacity(resource.getCapacity())
                .status(resource.getStatus())
                .description(resource.getDescription())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }
}

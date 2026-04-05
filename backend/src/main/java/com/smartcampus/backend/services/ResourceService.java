package com.smartcampus.backend.services;

import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.dto.ResourceRequestDTO;
import com.smartcampus.backend.entities.Resource;
import com.smartcampus.backend.enums.ResourceStatus;
import com.smartcampus.backend.enums.ResourceType;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.repo.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    // GET all with optional filters
    public List<ResourceDTO> getAllResources(ResourceType type, String location,
                                             Integer minCapacity, ResourceStatus status) {
        return resourceRepository
                .filterResources(type, location, minCapacity, status)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // GET by ID
    public ResourceDTO getResourceById(Long id) {
        Resource resource = findOrThrow(id);
        return toDTO(resource);
    }

    // POST — create
    public ResourceDTO createResource(ResourceRequestDTO dto) {
        Resource resource = new Resource();
        mapDtoToEntity(dto, resource);
        return toDTO(resourceRepository.save(resource));
    }

    // PUT — full update
    public ResourceDTO updateResource(Long id, ResourceRequestDTO dto) {
        Resource resource = findOrThrow(id);
        mapDtoToEntity(dto, resource);
        return toDTO(resourceRepository.save(resource));
    }

    // PATCH — status only
    public ResourceDTO updateStatus(Long id, ResourceStatus status) {
        Resource resource = findOrThrow(id);
        resource.setStatus(status);
        return toDTO(resourceRepository.save(resource));
    }

    // DELETE
    public void deleteResource(Long id) {
        Resource resource = findOrThrow(id);
        resourceRepository.delete(resource);
    }

    // ── helpers ────────────────────────────────────────────────

    private Resource findOrThrow(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with id: " + id));
    }

    private void mapDtoToEntity(ResourceRequestDTO dto, Resource resource) {
        resource.setName(dto.getName());
        resource.setType(dto.getType());
        resource.setLocation(dto.getLocation());
        resource.setDescription(dto.getDescription());
        resource.setCapacity(dto.getCapacity());
        resource.setAvailableFrom(dto.getAvailableFrom());
        resource.setAvailableTo(dto.getAvailableTo());
        resource.setResourceImageUrl(dto.getResourceImageUrl());
        resource.setStatus(
                dto.getStatus() != null ? dto.getStatus() : ResourceStatus.ACTIVE
        );
    }

    private ResourceDTO toDTO(Resource r) {
        ResourceDTO dto = new ResourceDTO();
        dto.setId(r.getId());
        dto.setName(r.getName());
        dto.setType(r.getType());
        dto.setLocation(r.getLocation());
        dto.setDescription(r.getDescription());
        dto.setCapacity(r.getCapacity());
        dto.setAvailableFrom(r.getAvailableFrom());
        dto.setAvailableTo(r.getAvailableTo());
        dto.setStatus(r.getStatus());
        dto.setResourceImageUrl(r.getResourceImageUrl());
        return dto;
    }
}
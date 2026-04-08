package com.smartcampus.backend.services;

import com.smartcampus.backend.model.Resource.ResourceStatus;
import com.smartcampus.backend.model.Resource.ResourceType;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repo.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public List<Resource> getAvailableResources() {
        return resourceRepository.findByStatus(ResourceStatus.AVAILABLE);
    }

    public List<Resource> getResourcesByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status);
    }

    public List<Resource> getResourcesByType(ResourceType type) {
        return resourceRepository.findByType(type);
    }

    public List<Resource> getResourcesByStatusAndType(ResourceStatus status, ResourceType type) {
        return resourceRepository.findByStatusAndType(status, type);
    }

    public List<Resource> searchResources(String query) {
        return resourceRepository.findByNameContainingIgnoreCase(query);
    }

    public List<Resource> filterResources(ResourceStatus status, ResourceType type, String search, String location, Integer minCapacity) {
        return resourceRepository.findAll().stream()
                .filter(r -> status == null || r.getStatus() == status)
                .filter(r -> type == null || r.getType() == type)
                .filter(r -> minCapacity == null || r.getCapacity() >= minCapacity)
                .filter(r -> location == null || location.isBlank() || containsIgnoreCase(r.getLocation(), location))
                .filter(r -> search == null || search.isBlank() || containsIgnoreCase(r.getName(), search)
                        || containsIgnoreCase(r.getLocation(), search)
                        || containsIgnoreCase(r.getDescription(), search))
                .toList();
    }

    private boolean containsIgnoreCase(String source, String target) {
        return source != null && target != null && source.toLowerCase().contains(target.toLowerCase());
    }

    public Resource createResource(Resource resource) {
        resource.onCreate();   // manually set timestamps
        return resourceRepository.save(resource);
    }

    public Resource updateResource(String id, Resource updatedResource) {
        Resource existing = getResourceById(id);

        existing.setName(updatedResource.getName());
        existing.setType(updatedResource.getType());
        existing.setLocation(updatedResource.getLocation());
        existing.setCapacity(updatedResource.getCapacity());
        existing.setStatus(updatedResource.getStatus());
        existing.setDescription(updatedResource.getDescription());
        if (updatedResource.getImageUrl() != null) {
            existing.setImageUrl(updatedResource.getImageUrl());
        }

        existing.onUpdate();   // update timestamp

        return resourceRepository.save(existing);
    }

    public Resource updateStatus(String id, ResourceStatus status) {
        Resource resource = getResourceById(id);
        resource.setStatus(status);

        resource.onUpdate();

        return resourceRepository.save(resource);
    }

    public void deleteResource(String id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(resource);
    }
}
package com.smartcampus.backend.services;

import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.Resource.ResourceStatus;
import com.smartcampus.backend.model.Resource.ResourceType;
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
        return resourceRepository.findByStatus(ResourceStatus.ACTIVE);
    }

    public List<Resource> getResourcesByType(ResourceType type) {
        return resourceRepository.findByType(type);
    }

    public List<Resource> getResourcesByStatusAndType(ResourceStatus status, ResourceType type) {
        return resourceRepository.findByStatusAndType(status, type);
    }

    public List<Resource> searchResources(String name) {
        return resourceRepository.findByNameContainingIgnoreCase(name);
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
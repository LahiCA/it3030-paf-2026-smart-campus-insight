package com.smartcampus.backend.services;

import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.Resource.ResourceStatus;
import com.smartcampus.backend.model.Resource.ResourceType;
import com.smartcampus.backend.repo.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    private Resource resource;

    @BeforeEach
    void setUp() {
        resource = new Resource();
        resource.setId("1");
        resource.setName("Test Lab");
        resource.setType(ResourceType.LAB);
        resource.setLocation("Block A");
        resource.setCapacity(30);
        resource.setStatus(ResourceStatus.AVAILABLE);
    }

    @Test
    void getAllResources_shouldReturnResources() {
        when(resourceRepository.findAll()).thenReturn(List.of(resource));

        List<Resource> result = resourceService.getAllResources();

        assertEquals(1, result.size());
        assertEquals("Test Lab", result.get(0).getName());
        verify(resourceRepository).findAll();
    }

    @Test
    void getResourceById_shouldReturnResource_whenExists() {
        when(resourceRepository.findById("1")).thenReturn(Optional.of(resource));

        Resource result = resourceService.getResourceById("1");

        assertEquals("Test Lab", result.getName());
        verify(resourceRepository).findById("1");
    }

    @Test
    void getResourceById_shouldThrowException_whenNotExists() {
        when(resourceRepository.findById("1")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> resourceService.getResourceById("1"));
    }

    @Test
    void createResource_shouldReturnCreatedResource() {
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);

        Resource result = resourceService.createResource(resource);

        assertEquals("Test Lab", result.getName());
        verify(resourceRepository).save(any(Resource.class));
    }

    @Test
    void updateResource_shouldReturnUpdatedResource() {
        when(resourceRepository.findById("1")).thenReturn(Optional.of(resource));
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);

        Resource result = resourceService.updateResource("1", resource);

        assertEquals("Test Lab", result.getName());
        verify(resourceRepository).findById("1");
        verify(resourceRepository).save(resource);
    }

    @Test
    void updateStatus_shouldUpdateStatus() {
        when(resourceRepository.findById("1")).thenReturn(Optional.of(resource));
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);

        Resource result = resourceService.updateStatus("1", ResourceStatus.MAINTENANCE);

        assertEquals(ResourceStatus.MAINTENANCE, result.getStatus());
        verify(resourceRepository).save(resource);
    }

    @Test
    void deleteResource_shouldDelete_whenExists() {
        when(resourceRepository.findById("1")).thenReturn(Optional.of(resource));

        resourceService.deleteResource("1");

        verify(resourceRepository).delete(resource);
    }

    @Test
    void deleteResource_shouldThrowException_whenNotExists() {
        when(resourceRepository.findById("1")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> resourceService.deleteResource("1"));
    }
}

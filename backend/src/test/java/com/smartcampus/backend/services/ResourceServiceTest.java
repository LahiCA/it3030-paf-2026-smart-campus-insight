package com.smartcampus.backend.services;

import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.dto.ResourceRequestDTO;
import com.smartcampus.backend.enums.ResourceStatus;
import com.smartcampus.backend.enums.ResourceType;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.repo.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private ResourceService resourceService;

    private Resource resource;
    private ResourceRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        resource = new Resource();
        resource.setId("1");
        resource.setName("Test Lab");
        resource.setType(ResourceType.LAB);
        resource.setLocation("Block A");
        resource.setCapacity(30);
        resource.setStatus(ResourceStatus.ACTIVE);

        requestDTO = new ResourceRequestDTO();
        requestDTO.setName("Test Lab");
        requestDTO.setType(ResourceType.LAB);
        requestDTO.setLocation("Block A");
        requestDTO.setCapacity(30);
        requestDTO.setStatus(ResourceStatus.ACTIVE);
    }

    @Test
    void getAllResources_shouldReturnFilteredResources() {
        // Given
        when(mongoTemplate.find(any(Query.class), eq(Resource.class)))
                .thenReturn(List.of(resource));

        // When
        List<ResourceDTO> result = resourceService.getAllResources(
                ResourceType.LAB, "Block A", 20, ResourceStatus.ACTIVE);

        // Then
        assertEquals(1, result.size());
        assertEquals("Test Lab", result.get(0).getName());
        verify(mongoTemplate).find(any(Query.class), eq(Resource.class));
    }

    @Test
    void getResourceById_shouldReturnResource_whenExists() {
        // Given
        when(resourceRepository.findById("1")).thenReturn(Optional.of(resource));

        // When
        ResourceDTO result = resourceService.getResourceById("1");

        // Then
        assertEquals("Test Lab", result.getName());
        verify(resourceRepository).findById("1");
    }

    @Test
    void getResourceById_shouldThrowException_whenNotExists() {
        // Given
        when(resourceRepository.findById("1")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> resourceService.getResourceById("1"));
    }

    @Test
    void createResource_shouldReturnCreatedResource() {
        // Given
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);

        // When
        ResourceDTO result = resourceService.createResource(requestDTO, null);

        // Then
        assertEquals("Test Lab", result.getName());
        verify(resourceRepository).save(any(Resource.class));
    }

    @Test
    void updateResource_shouldReturnUpdatedResource() {
        // Given
        when(resourceRepository.findById("1")).thenReturn(Optional.of(resource));
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);

        // When
        ResourceDTO result = resourceService.updateResource("1", requestDTO, null);

        // Then
        assertEquals("Test Lab", result.getName());
        verify(resourceRepository).findById("1");
        verify(resourceRepository).save(resource);
    }

    @Test
    void updateStatus_shouldUpdateStatus() {
        // Given
        when(resourceRepository.findById("1")).thenReturn(Optional.of(resource));
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);

        // When
        ResourceDTO result = resourceService.updateStatus("1", ResourceStatus.OUT_OF_SERVICE);

        // Then
        assertEquals(ResourceStatus.OUT_OF_SERVICE, result.getStatus());
        verify(resourceRepository).save(resource);
    }

    @Test
    void deleteResource_shouldDelete_whenExists() {
        // Given
        when(resourceRepository.findById("1")).thenReturn(Optional.of(resource));

        // When
        resourceService.deleteResource("1");

        // Then
        verify(resourceRepository).delete(resource);
    }

    @Test
    void deleteResource_shouldThrowException_whenNotExists() {
        // Given
        when(resourceRepository.findById("1")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class,
                () -> resourceService.deleteResource("1"));
    }
}
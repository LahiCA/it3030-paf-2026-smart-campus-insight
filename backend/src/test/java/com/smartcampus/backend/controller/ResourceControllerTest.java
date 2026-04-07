package com.smartcampus.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.Resource.ResourceStatus;
import com.smartcampus.backend.model.Resource.ResourceType;
import com.smartcampus.backend.repo.BookingRepository;
import com.smartcampus.backend.repo.ResourceRepository;
import com.smartcampus.backend.repo.UserRepository;
import com.smartcampus.backend.services.ResourceService;
import com.smartcampus.backend.utils.FileUploadUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(value = ResourceController.class,
        excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration.class,
                org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration.class
        })
@AutoConfigureMockMvc(addFilters = false)
class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ResourceService resourceService;

    @MockBean
    private FileUploadUtil fileUploadUtil;

    @MockBean
    private ResourceRepository resourceRepository;

    @MockBean
    private BookingRepository bookingRepository;

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Resource resource;

    @BeforeEach
    void setUp() {
        resource = new Resource();
        resource.setId("1");
        resource.setName("Test Lab");
        resource.setType(ResourceType.LAB);
        resource.setLocation("Block A");
        resource.setCapacity(30);
        resource.setStatus(ResourceStatus.ACTIVE);
    }

    @Test
    void getAllResources_shouldReturnResources() throws Exception {
        // Given
        when(resourceService.getAllResources()).thenReturn(List.of(resource));

        // When & Then
        mockMvc.perform(get("/api/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Lab"));
    }

    @Test
    void getResourceById_shouldReturnResource() throws Exception {
        // Given
        when(resourceService.getResourceById("1")).thenReturn(resource);

        // When & Then
        mockMvc.perform(get("/api/resources/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Lab"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createResource_shouldCreateResource() throws Exception {
        // Given
        when(resourceService.createResource(any(Resource.class))).thenReturn(resource);

        // When & Then
        mockMvc.perform(multipart("/api/resources")
                        .file("images", new byte[0])
                        .param("name", "Test Lab")
                        .param("type", "LAB")
                        .param("location", "Block A")
                        .param("capacity", "30")
                        .param("status", "ACTIVE")
                        .with(csrf()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Lab"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateResource_shouldUpdateResource() throws Exception {
        // Given
        when(resourceService.updateResource(eq("1"), any(Resource.class))).thenReturn(resource);

        // When & Then
        mockMvc.perform(multipart("/api/resources/1")
                        .file("images", new byte[0])
                        .param("name", "Test Lab")
                        .param("type", "LAB")
                        .param("location", "Block A")
                        .param("capacity", "30")
                        .param("status", "ACTIVE")
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        })
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Lab"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_shouldUpdateStatus() throws Exception {
        // Given
        when(resourceService.updateStatus("1", ResourceStatus.MAINTENANCE)).thenReturn(resource);

        // When & Then
        mockMvc.perform(patch("/api/resources/1/status")
                        .with(csrf())
                        .param("status", "MAINTENANCE"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteResource_shouldDeleteResource() throws Exception {
        // When & Then
        mockMvc.perform(delete("/api/resources/1")
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

}
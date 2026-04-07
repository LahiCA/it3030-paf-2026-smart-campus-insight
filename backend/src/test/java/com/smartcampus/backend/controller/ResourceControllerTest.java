package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.ResourceDTO;
import com.smartcampus.backend.dto.ResourceRequestDTO;
import com.smartcampus.backend.enums.ResourceStatus;
import com.smartcampus.backend.enums.ResourceType;
import com.smartcampus.backend.services.ResourceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
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

@WebMvcTest(ResourceController.class)
class ResourceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ResourceService resourceService;

    @Autowired
    private ObjectMapper objectMapper;

    private ResourceDTO resourceDTO;
    private ResourceRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        resourceDTO = new ResourceDTO();
        resourceDTO.setId("1");
        resourceDTO.setName("Test Lab");
        resourceDTO.setType(ResourceType.LAB);
        resourceDTO.setLocation("Block A");
        resourceDTO.setCapacity(30);
        resourceDTO.setStatus(ResourceStatus.ACTIVE);

        requestDTO = new ResourceRequestDTO();
        requestDTO.setName("Test Lab");
        requestDTO.setType(ResourceType.LAB);
        requestDTO.setLocation("Block A");
        requestDTO.setCapacity(30);
        requestDTO.setStatus(ResourceStatus.ACTIVE);
    }

    @Test
    void getAllResources_shouldReturnResources() throws Exception {
        // Given
        when(resourceService.getAllResources(null, null, null, null))
                .thenReturn(List.of(resourceDTO));

        // When & Then
        mockMvc.perform(get("/api/resources"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Lab"));
    }

    @Test
    void getResourceById_shouldReturnResource() throws Exception {
        // Given
        when(resourceService.getResourceById("1")).thenReturn(resourceDTO);

        // When & Then
        mockMvc.perform(get("/api/resources/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Lab"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createResource_shouldCreateResource() throws Exception {
        // Given
        when(resourceService.createResource(any(ResourceRequestDTO.class), any()))
                .thenReturn(resourceDTO);

        // When & Then
        mockMvc.perform(post("/api/resources")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Lab"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateResource_shouldUpdateResource() throws Exception {
        // Given
        when(resourceService.updateResource(eq("1"), any(ResourceRequestDTO.class), any()))
                .thenReturn(resourceDTO);

        // When & Then
        mockMvc.perform(put("/api/resources/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Lab"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_shouldUpdateStatus() throws Exception {
        // Given
        when(resourceService.updateStatus("1", ResourceStatus.OUT_OF_SERVICE))
                .thenReturn(resourceDTO);

        // When & Then
        mockMvc.perform(patch("/api/resources/1/status")
                        .with(csrf())
                        .param("status", "OUT_OF_SERVICE"))
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

    @Test
    void createResource_shouldRequireAdminRole() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/resources")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isUnauthorized());
    }
}
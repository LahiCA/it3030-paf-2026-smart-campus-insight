package com.smartcampus.backend.dto;

import com.smartcampus.backend.enums.ResourceStatus;
import com.smartcampus.backend.enums.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ResourceRequestDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    private LocalTime availableFrom;

    private LocalTime availableTo;

    private ResourceStatus status;

    private String resourceImageUrl;
}

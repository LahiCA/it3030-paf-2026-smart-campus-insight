package com.smartcampus.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.smartcampus.backend.enums.ResourceStatus;
import com.smartcampus.backend.enums.ResourceType;
import com.smartcampus.backend.model.Booking;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalTime;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Document(collection = "resources")
public class ResourceDTO {

    @Id
    private String id;  // MongoDB uses String _id

    private String name;
    private ResourceType type;
    private String location;
    private String description;
    private Integer capacity;
    
    private LocalTime availableFrom;
    private LocalTime availableTo;

    private ResourceStatus status;
    private List<String> resourceImageUrls;
    private List<Booking> bookings; // Use Booking model instead of DTO
}
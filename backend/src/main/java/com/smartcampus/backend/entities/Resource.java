package com.smartcampus.backend.entities;

import com.smartcampus.backend.entities.Resource.ResourceStatus;
import com.smartcampus.backend.entities.Resource.ResourceType;
import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Document(collection = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    private String id;   // MongoDB uses String (ObjectId)

    @NotBlank(message = "Resource name is required")
    private String name;

    private ResourceType type;

    @NotBlank(message = "Location is required")
    private String location;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    @Builder.Default
    private ResourceStatus status = ResourceStatus.AVAILABLE;

    private String description;

    private String imageUrl;

    private LocalTime availableFrom;
    private LocalTime availableTo;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Automatically set timestamps
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ResourceType {
        LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT, SPORTS, STUDY_ROOM, AUDITORIUM, OTHER
    }

    public enum ResourceStatus {
        AVAILABLE, OUT_OF_SERVICE, OCCUPIED, MAINTENANCE, RETIRED
    }
}
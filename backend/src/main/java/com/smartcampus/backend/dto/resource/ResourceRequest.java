package com.smartcampus.backend.dto.resource;

import lombok.Data;

@Data
public class ResourceRequest {
    private String name;
    private String type;
    private String location;
    private Integer capacity;
    private String status;
    private String description;
}

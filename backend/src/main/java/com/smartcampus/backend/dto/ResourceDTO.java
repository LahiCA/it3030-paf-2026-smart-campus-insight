package com.smartcampus.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.smartcampus.backend.dto.BookingDTO;


import java.util.List;

import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResourceDTO {

    private Long id;
    private String type;        
    private String location;
    private String description;
    private int capacity;
    private String availability;
    private String windows;
    private String status;
    private String resourceImageUrl;
    private List<BookingDTO> bookings;
}

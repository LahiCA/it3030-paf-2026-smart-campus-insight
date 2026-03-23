package com.smartcampus.backend.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data 
@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private String location;
    private String description;
    private int capacity;
    private String availability;
    private String windows;
    private String status;
    private String resourceImageUrl;
    private List<Booking> bookings = new ArrayList<>();

    @Override
    public String toString() {
        return "Resource{" +
                "id=" + id +
                ", type='" + type + '\'' +
                ", location='" + location + '\'' +
                ", description='" + description + '\'' +
                ", capacity=" + capacity +
                ", availability='" + availability + '\'' +
                ", windows='" + windows + '\'' +
                ", status='" + status + '\'' +
                ", resourceImageUrl='" + resourceImageUrl + '\'' +
                ", bookings=" + bookings +
                '}';
    }
    
}

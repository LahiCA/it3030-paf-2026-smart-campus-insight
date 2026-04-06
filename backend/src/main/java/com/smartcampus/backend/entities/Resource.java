package com.smartcampus.backend.entities;

import com.smartcampus.backend.enums.ResourceStatus;
import com.smartcampus.backend.enums.ResourceType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Type is required")
    private ResourceType type;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;

    private Integer capacity;

    private LocalTime availableFrom;

    private LocalTime availableTo;

    @Enumerated(EnumType.STRING)
    private ResourceStatus status = ResourceStatus.ACTIVE;

    private String resourceImageUrl;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "resource", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Booking> bookings = new ArrayList<>();
}

/* package com.smartcampus.backend.entities;


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

    @OneToMany(mappedBy = "resource", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
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
 */
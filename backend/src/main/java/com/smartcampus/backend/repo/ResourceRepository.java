package com.smartcampus.backend.repo;

import com.smartcampus.backend.entities.Resource;
import com.smartcampus.backend.enums.ResourceStatus;
import com.smartcampus.backend.enums.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ResourceRepository extends MongoRepository<Resource, String> {

    // Filter with optional params — using method name query
    List<Resource> findByTypeAndLocationContainingIgnoreCaseAndCapacityGreaterThanEqualAndStatus(
        ResourceType type, String location, Integer minCapacity, ResourceStatus status
    );

    // For optional params, we can use multiple methods or custom query
    @Query("{ 'type' : ?0, 'location' : { $regex: ?1, $options: 'i' }, 'capacity' : { $gte: ?2 }, 'status' : ?3 }")
    List<Resource> filterResources(ResourceType type, String location, Integer minCapacity, ResourceStatus status);

    // Available resources - this is complex in MongoDB, might need service layer logic
    // For now, placeholder
    List<Resource> findByType(ResourceType type);

    // All resources with no bookings - in MongoDB, check if bookings array is empty
    @Query("{ 'bookings' : { $size: 0 } }")
    List<Resource> getAllAvailableResources();

    // Distinct types
    @Query(value = "{}", fields = "{ 'type' : 1 }")
    List<Resource> findAllTypes();

}

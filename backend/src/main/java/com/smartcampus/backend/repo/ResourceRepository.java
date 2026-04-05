package com.smartcampus.backend.repo;

import com.smartcampus.backend.entities.Resource;
import com.smartcampus.backend.enums.ResourceStatus;
import com.smartcampus.backend.enums.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    // Filter with optional params — nulls are ignored
    @Query("SELECT r FROM Resource r WHERE " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
           "(:status IS NULL OR r.status = :status)")
    List<Resource> filterResources(
        @Param("type") ResourceType type,
        @Param("location") String location,
        @Param("minCapacity") Integer minCapacity,
        @Param("status") ResourceStatus status
    );

    // Available resources not booked in the given date range — fixed subquery
    @Query("SELECT r FROM Resource r WHERE r.type = :type AND r.id NOT IN " +
           "(SELECT b.resource.id FROM Booking b WHERE " +
           "b.checkInDate <= :checkOutDate AND b.checkOutDate > :checkInDate)")
    List<Resource> findAvailableByDateAndType(
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate,
        @Param("type") ResourceType type
    );

    // All resources with no bookings at all
    @Query("SELECT r FROM Resource r WHERE r.id NOT IN (SELECT b.resource.id FROM Booking b)")
    List<Resource> getAllAvailableResources();

    // Distinct types that exist in the catalogue
    @Query("SELECT DISTINCT r.type FROM Resource r")
    List<ResourceType> findDistinctResourceTypes();
}

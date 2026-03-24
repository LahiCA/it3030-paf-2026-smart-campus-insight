package com.smartcampus.backend.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.smartcampus.backend.entities.Resource;

import java.time.LocalDate;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    @Query("SELECT DISTINCT r.resourceType FROM Resource r")
    List<String> findDistinctResourceTypes();

    @Query("SELECT r FROM Resource r WHERE r.resourceType LIKE %:resourceType% AND r.id NOT IN (SELECT b FROM Booking b  WHERE (b.checkInDate <= :checkOutDate) AND (b.checkOutDate > :checkInDate)) ")
    List<Resource> findAvailableResourceByDateAndType(LocalDate checkInDate, LocalDate checkOutDate, String resourceType);

    @Query("SELECT r FROM Resource r WHERE r.id NOT IN (SELECT b.resource.id FROM Booking b)")
    List<Resource> getAllAvailableResources();


}

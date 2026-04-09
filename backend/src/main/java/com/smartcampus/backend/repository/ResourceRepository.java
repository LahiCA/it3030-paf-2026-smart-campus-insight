package com.smartcampus.backend.repository;


import com.smartcampus.backend.entities.Resource;
import com.smartcampus.backend.entities.Resource.ResourceStatus;
import com.smartcampus.backend.entities.Resource.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByType(ResourceType type);

    List<Resource> findByStatusAndType(ResourceStatus status, ResourceType type);

    List<Resource> findByNameContainingIgnoreCase(String name);
}
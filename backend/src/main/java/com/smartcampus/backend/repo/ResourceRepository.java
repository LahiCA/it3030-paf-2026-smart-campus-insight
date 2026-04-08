package com.smartcampus.backend.repo;

import com.smartcampus.backend.model.Resource;
import com.smartcampus.backend.model.Resource.ResourceStatus;
import com.smartcampus.backend.model.Resource.ResourceType;
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
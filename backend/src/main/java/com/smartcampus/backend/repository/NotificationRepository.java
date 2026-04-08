package com.smartcampus.backend.repository;

import com.smartcampus.backend.entities.Notification;
import com.smartcampus.backend.enums.NotificationType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

        List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

        List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(String userId);

        Long countByUserIdAndReadFalse(String userId);

        List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(String userId, NotificationType type);

        List<Notification> findByUserIdAndRelatedEntityIdAndRelatedEntityType(
                        String userId, String relatedEntityId, String relatedEntityType);

        void deleteByUserId(String userId);
}

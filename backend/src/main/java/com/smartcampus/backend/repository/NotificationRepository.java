package com.smartcampus.backend.repository;

import com.smartcampus.backend.entities.Notification;
import com.smartcampus.backend.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * NotificationRepository
 * 
 * Spring Data JPA repository for Notification entity.
 * Provides CRUD operations plus custom queries for common notification tasks.
 * 
 * Custom query methods:
 * - Find notifications by user
 * - Find unread notifications
 * - Find by type
 * - Count unread notifications
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Find all notifications for a specific user
     * Ordered by creation date (newest first)
     * 
     * @param userId The user ID
     * @return List of notifications for that user
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find all unread notifications for a user
     * Used for notification bell badge (showing count)
     * 
     * @param userId The user ID
     * @return List of unread notifications
     */
    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(Long userId);

    /**
     * Count how many unread notifications a user has
     * Efficient: returns just a count, not full notification objects
     * Perfect for notification bell showing unread count
     * 
     * @param userId The user ID
     * @return Number of unread notifications
     */
    Long countByUserIdAndReadFalse(Long userId);

    /**
     * Find notifications by type
     * Useful for filtering: show only booking notifications
     * 
     * @param userId The user ID
     * @param type   The notification type (BOOKING_APPROVED, TICKET_UPDATED, etc.)
     * @return List of notifications of that type for the user
     */
    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, NotificationType type);

    /**
     * Find a notification by user and related entity
     * If user modifies a booking and wants to see related notifications
     * 
     * @param userId            The user ID
     * @param relatedEntityId   The booking/ticket ID
     * @param relatedEntityType The type (BOOKING, TICKET, etc.)
     * @return List of notifications related to that entity
     */
    List<Notification> findByUserIdAndRelatedEntityIdAndRelatedEntityType(
            Long userId, Long relatedEntityId, String relatedEntityType);

    /**
     * Custom JPQL query to find notifications with multiple conditions
     * You can use @Query for complex queries that don't fit method naming
     * 
     * @param userId The user ID
     * @return List of notifications that are unread and recent
     */
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.read = false " +
            "ORDER BY n.createdAt DESC LIMIT 10")
    List<Notification> findRecentUnreadNotifications(@Param("userId") Long userId);
}

package com.smartcampus.backend.tickets.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Ticket {

    @Id
    private String id;

    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private String userId;
    private String userDisplayId;
    private String contactNumber;
    private String assignedTo;
    private String resolutionNotes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime firstResponseAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime updatedAt;
    private Integer rating;
    private String feedback;
    private LocalDateTime ratedAt;

    @Builder.Default
    @Transient
    private List<TicketImage> attachments = new ArrayList<>();

    @Builder.Default
    @Transient
    private List<Comment> comments = new ArrayList<>();

    public String getTimeToFirstResponse() {
        return formatDuration(createdAt, firstResponseAt);
    }

    public String getTimeToResolution() {
        return formatDuration(createdAt, resolvedAt);
    }

    private static String formatDuration(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return null;
        }
        long minutes = java.time.Duration.between(start, end).toMinutes();
        if (minutes < 1) {
            return "Less than a minute";
        }
        long hours = minutes / 60;
        long remainingMinutes = minutes % 60;
        if (hours > 0) {
            return remainingMinutes > 0
                    ? String.format("%d hr%s %d min%s", hours, hours == 1 ? "" : "s", remainingMinutes,
                            remainingMinutes == 1 ? "" : "s")
                    : String.format("%d hr%s", hours, hours == 1 ? "" : "s");
        }
        return String.format("%d min%s", minutes, minutes == 1 ? "" : "s");
    }
}

package com.smartcampus.backend.tickets.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentCreateRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    private String userDisplayId;

    @NotBlank(message = "Comment message is required")
    @Size(min = 1, max = 1000, message = "Comment must be between 1 and 1000 characters")
    private String message;
}

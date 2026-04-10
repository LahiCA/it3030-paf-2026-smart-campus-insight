package com.smartcampus.backend.dto.request;

import lombok.Data;

@Data
public class ChatRequest {
    private String message;
    private String role; // ADMIN, LECTURER, TECHNICIAN
}

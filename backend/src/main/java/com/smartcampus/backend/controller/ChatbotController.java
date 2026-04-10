package com.smartcampus.backend.controller;

import com.smartcampus.backend.dto.request.ChatRequest;
import com.smartcampus.backend.dto.response.ChatResponse;
import com.smartcampus.backend.service.GeminiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final GeminiChatService geminiChatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        ChatResponse response = geminiChatService.chat(request.getMessage(), request.getRole());
        return ResponseEntity.ok(response);
    }
}

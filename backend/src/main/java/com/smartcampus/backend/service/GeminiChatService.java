package com.smartcampus.backend.service;

import com.smartcampus.backend.dto.response.ChatResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class GeminiChatService {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String apiUrl;

    public GeminiChatService(
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.api.url}") String apiUrl) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.restTemplate = new RestTemplate();
    }

    private String buildSystemPrompt(String role) {
        String roleContext = switch (role != null ? role.toUpperCase() : "LECTURER") {
            case "ADMIN" -> """
                    The user is a Campus Administrator. They can:
                    - Manage all users (lecturers, technicians)
                    - Approve or reject facility booking requests
                    - View campus-wide statistics and reports
                    - Send notifications to all users or specific groups
                    - Manage campus resources (rooms, labs, equipment)
                    - View and manage all support/maintenance tickets
                    Help them with administrative tasks, approvals, user management, and campus oversight.
                    """;
            case "TECHNICIAN" -> """
                    The user is a Campus Technician. They can:
                    - View and manage maintenance tickets assigned to them
                    - Update ticket status (Open, In Progress, Resolved)
                    - Report new maintenance issues they discover
                    - View campus resource details and locations
                    Help them with their maintenance tasks, ticket updates, and issue reporting.
                    """;
            default -> """
                    The user is a Lecturer. They can:
                    - Search for and book rooms, labs, and equipment
                    - Check their booking statuses
                    - Report maintenance issues by creating support tickets
                    - View their notifications
                    Help them with room bookings, equipment reservations, and issue reporting.
                    """;
        };

        return """
                You are the Smart Campus AI Assistant for a university campus management system.
                Your name is "Smart Campus Assistant".

                SYSTEM CONTEXT:
                - This is the Smart Campus Operations Hub — a web application for managing campus resources
                - Resources include: Lecture Halls, Computer Labs, Meeting Rooms, and Equipment
                - Users can book resources, report maintenance issues (tickets), and receive notifications
                - There are three user roles: ADMIN, LECTURER, and TECHNICIAN

                CURRENT USER ROLE:
                %s

                RESPONSE GUIDELINES:
                1. Be helpful, concise, and professional
                2. Use clear formatting with bullet points and emojis where appropriate
                3. When the user asks about bookings, resources, tickets, or notifications, provide helpful guidance
                4. If asked to perform an action (like booking a room), explain the steps they should take in the app
                5. Provide relevant suggestions for follow-up actions
                6. Keep responses focused and under 150 words unless detailed explanation is needed
                7. Always respond in a friendly, campus-appropriate tone
                8. If you don't know something specific about the campus data, suggest where in the app they can find it

                IMPORTANT: At the end of every response, add a line starting with "SUGGESTIONS:" followed by 2-4 short
                follow-up action suggestions separated by " | ". These will be shown as clickable chips.
                Example: SUGGESTIONS: Find a room | Check my bookings | Report an issue

                Now respond to the user's message.
                """.formatted(roleContext);
    }

    public ChatResponse chat(String userMessage, String role) {
        try {
            String systemPrompt = buildSystemPrompt(role);

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> userPart = Map.of("text", systemPrompt + "\n\nUser message: " + userMessage);
            Map<String, Object> userContent = Map.of("role", "user", "parts", List.of(userPart));
            requestBody.put("contents", List.of(userContent));
            requestBody.put("generationConfig", Map.of(
                    "temperature", 0.7,
                    "topP", 0.95,
                    "topK", 40,
                    "maxOutputTokens", 1024));

            String fullUrl = apiUrl + "?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.exchange(fullUrl, HttpMethod.POST, entity, Map.class);

            return parseGeminiResponse(response.getBody());

        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            return ChatResponse.builder()
                    .reply("I'm having trouble connecting to my AI service right now. Please try again in a moment.")
                    .suggestions(List.of("Try again", "Find a room", "Check my bookings"))
                    .build();
        }
    }

    @SuppressWarnings({ "unchecked", "rawtypes" })
    private ChatResponse parseGeminiResponse(Map response) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return fallbackResponse();
            }

            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String fullText = (String) parts.get(0).get("text");

            String reply;
            List<String> suggestions;

            int sugIdx = fullText.lastIndexOf("SUGGESTIONS:");
            if (sugIdx != -1) {
                reply = fullText.substring(0, sugIdx).trim();
                String sugLine = fullText.substring(sugIdx + "SUGGESTIONS:".length()).trim();
                suggestions = Arrays.asList(sugLine.split("\\s*\\|\\s*"));
            } else {
                reply = fullText.trim();
                suggestions = List.of("Find a room", "Check bookings", "Report an issue");
            }

            return ChatResponse.builder()
                    .reply(reply)
                    .suggestions(suggestions)
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            return fallbackResponse();
        }
    }

    private ChatResponse fallbackResponse() {
        return ChatResponse.builder()
                .reply("I couldn't process that request. Could you try rephrasing?")
                .suggestions(List.of("Find a room", "My bookings", "Report an issue"))
                .build();
    }
}

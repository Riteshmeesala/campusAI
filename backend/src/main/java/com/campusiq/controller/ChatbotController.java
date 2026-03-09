package com.campusiq.controller;

import com.campusiq.dto.request.ChatRequest;
import com.campusiq.dto.response.ApiResponse;
import com.campusiq.entity.User;
import com.campusiq.repository.UserRepository;
import com.campusiq.security.UserPrincipal;
import com.campusiq.service.AIChatbotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.*;

/**
 * ChatbotController — POST /api/chatbot/chat
 *
 * Receives the user message + optional conversation history from the frontend.
 * Passes both to AIChatbotService which calls OpenAI GPT with the full context.
 *
 * Response format: { "data": { "response": "...", "suggestions": [...], ... } }
 * Frontend reads: res.data.data.response  (also supports legacy "reply" key)
 */
@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
@Slf4j
public class ChatbotController {

    private final AIChatbotService aiChatbotService;
    private final UserRepository   userRepository;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<Map<String, Object>>> chat(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found: " + currentUser.getId()));

        log.info("Chatbot request: user={} role={} msg={}",
                user.getUsername(), user.getRole(), request.getMessage());

        // Pass history so GPT maintains multi-turn memory (like ChatGPT)
        Map<String, Object> aiResult = aiChatbotService.chat(
                user,
                request.getMessage(),
                request.getHistory()   // List<Map<String,String>> — may be null
        );

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("response",    aiResult.get("response"));
        responseData.put("reply",       aiResult.get("response")); // legacy alias
        responseData.put("suggestions", aiResult.get("suggestions"));
        responseData.put("user",        aiResult.get("user"));
        responseData.put("role",        aiResult.get("role"));
        responseData.put("aiPowered",   aiResult.get("aiPowered"));
        responseData.put("timestamp",   aiResult.get("timestamp"));

        return ResponseEntity.ok(ApiResponse.success(responseData));
    }
}
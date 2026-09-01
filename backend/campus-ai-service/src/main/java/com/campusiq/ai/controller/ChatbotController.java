package com.campusiq.ai.controller;

import com.campusiq.ai.dto.ChatRequest;
import com.campusiq.ai.entity.User;
import com.campusiq.ai.repository.UserRepository;
import com.campusiq.ai.service.AIChatbotService;
import com.campusiq.common.dto.ApiResponse;
import com.campusiq.common.security.UserPrincipal;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/chatbot")
public class ChatbotController {

    private static final Logger log = LoggerFactory.getLogger(ChatbotController.class);

    private final AIChatbotService aiChatbotService;
    private final UserRepository userRepository;

    public ChatbotController(AIChatbotService aiChatbotService, UserRepository userRepository) {
        this.aiChatbotService = aiChatbotService;
        this.userRepository = userRepository;
    }

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<Map<String, Object>>> chat(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found: " + currentUser.getId()));

        log.info("Chatbot request: user={} role={} msg={}",
                user.getUsername(), user.getRole(), request.getMessage());

        Map<String, Object> aiResult = aiChatbotService.chat(
                user,
                request.getMessage(),
                request.getHistory()
        );

        Map<String, Object> responseData = new LinkedHashMap<>();
        responseData.put("response", aiResult.get("response"));
        responseData.put("reply", aiResult.get("response"));
        responseData.put("suggestions", aiResult.get("suggestions"));
        responseData.put("user", aiResult.get("user"));
        responseData.put("role", aiResult.get("role"));
        responseData.put("aiPowered", aiResult.get("aiPowered"));
        responseData.put("timestamp", aiResult.get("timestamp"));

        return ResponseEntity.ok(ApiResponse.success(responseData));
    }
}

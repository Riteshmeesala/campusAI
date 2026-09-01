package com.campusiq.ai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class GrokService {

    private static final Logger log = LoggerFactory.getLogger(GrokService.class);

    @Value("${grok.api-key:}")
    private String apiKey;

    @Value("${grok.model:grok-beta}")
    private String model;

    @Value("${grok.timeout-seconds:25}")
    private int timeoutSeconds;

    @Value("${grok.base-url:https://api.x.ai/v1}")
    private String baseUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public String askGrokAI(String systemPrompt, List<Map<String, String>> history, String userMessage) {
        if (!isAvailable()) {
            return null;
        }

        String endpoint = baseUrl.endsWith("/v1")
                ? baseUrl + "/chat/completions"
                : (baseUrl.endsWith("/openai") ? baseUrl + "/v1/chat/completions" : baseUrl + "/chat/completions");

        log.info("[Grok AI] Calling {} with model {}", endpoint, model);

        try {
            String requestBody = buildChatCompletionJson(systemPrompt, history, userMessage);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey.trim())
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                String text = extractMessageContent(response.body());
                if (text != null && !text.isBlank()) {
                    text = stripReasoningTags(text);
                    log.info("[Grok AI] Response received successfully (length: {})", text.length());
                    return text.trim();
                }
            } else {
                log.warn("[Grok AI] HTTP {} - {}", response.statusCode(),
                        response.body() != null ? response.body().substring(0, Math.min(200, response.body().length())) : "No body");
            }
        } catch (Exception e) {
            log.warn("[Grok AI] API call failed: {}", e.getMessage());
        }

        return null;
    }

    public boolean isAvailable() {
        if (apiKey == null || apiKey.isBlank()) return false;
        String trimmed = apiKey.trim();
        return !trimmed.equalsIgnoreCase("your_groq_api_key_here")
                && !trimmed.equalsIgnoreCase("gsk_mock_or_actual_key")
                && trimmed.length() > 15;
    }

    private String buildChatCompletionJson(String systemPrompt, List<Map<String, String>> history, String userMessage) {
        StringBuilder msgs = new StringBuilder();
        msgs.append("[");

        if (systemPrompt != null && !systemPrompt.isBlank()) {
            msgs.append("{\"role\":\"system\",\"content\":").append(toJsonString(systemPrompt)).append("}");
        }

        if (history != null && !history.isEmpty()) {
            for (Map<String, String> turn : history) {
                String r = turn.getOrDefault("role", "user");
                String c = turn.getOrDefault("content", "");
                if (c != null && !c.isBlank()) {
                    if (msgs.length() > 1) msgs.append(",");
                    msgs.append("{\"role\":\"").append(r).append("\",\"content\":").append(toJsonString(c)).append("}");
                }
            }
        }

        if (msgs.length() > 1) msgs.append(",");
        msgs.append("{\"role\":\"user\",\"content\":").append(toJsonString(userMessage)).append("}");
        msgs.append("]");

        return "{"
                + "\"model\":" + toJsonString(model) + ","
                + "\"messages\":" + msgs + ","
                + "\"temperature\":0.7,"
                + "\"max_tokens\":2048"
                + "}";
    }

    private String extractMessageContent(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            int choicesIdx = json.indexOf("\"choices\"");
            if (choicesIdx < 0) return null;

            String marker1 = "\"content\":\"";
            String marker2 = "\"content\": \"";

            int idx = json.indexOf(marker1, choicesIdx);
            int markerLen = marker1.length();

            if (idx < 0) {
                idx = json.indexOf(marker2, choicesIdx);
                markerLen = marker2.length();
            }

            if (idx < 0) return null;

            int start = idx + markerLen;
            StringBuilder sb = new StringBuilder();
            boolean escaped = false;

            for (int i = start; i < json.length(); i++) {
                char ch = json.charAt(i);
                if (escaped) {
                    switch (ch) {
                        case 'n' -> sb.append('\n');
                        case 't' -> sb.append('\t');
                        case 'r' -> {}
                        case '"' -> sb.append('"');
                        case '\\' -> sb.append('\\');
                        case 'u' -> {
                            if (i + 4 < json.length()) {
                                String hex = json.substring(i + 1, i + 5);
                                try {
                                    sb.append((char) Integer.parseInt(hex, 16));
                                    i += 4;
                                } catch (NumberFormatException ignored) {
                                    sb.append('\\').append('u');
                                }
                            }
                        }
                        default -> sb.append(ch);
                    }
                    escaped = false;
                } else if (ch == '\\') {
                    escaped = true;
                } else if (ch == '"') {
                    break;
                } else {
                    sb.append(ch);
                }
            }
            return sb.toString();
        } catch (Exception e) {
            return null;
        }
    }

    private String toJsonString(String val) {
        if (val == null) return "\"\"";
        return "\""
                + val.replace("\\", "\\\\")
                     .replace("\"", "\\\"")
                     .replace("\n", "\\n")
                     .replace("\r", "")
                     .replace("\t", "\\t")
                + "\"";
    }

    private String stripReasoningTags(String text) {
        if (text == null) return null;
        String cleaned = text.replaceAll("(?s)<think>.*?</think>", "").trim();
        int idx = cleaned.indexOf("<think>");
        if (idx >= 0) cleaned = cleaned.substring(0, idx).trim();
        return cleaned.isBlank() ? text.trim() : cleaned;
    }
}

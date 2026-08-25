package com.campusiq.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │              GrokService — Cloud AI via xAI Grok API                │
 * │                                                                      │
 * │  Replaces OllamaService with xAI's Grok API (OpenAI-compatible).   │
 * │  Endpoint:  https://api.x.ai/v1/chat/completions                   │
 * │                                                                      │
 * │  Request  →  POST /v1/chat/completions                              │
 * │              { "model": "grok-3-mini",                              │
 * │                "messages": [                                         │
 * │                  {"role": "system", "content": "..."},              │
 * │                  {"role": "user",   "content": "..."}               │
 * │                ] }                                                   │
 * │                                                                      │
 * │  Response →  { "choices": [{"message":{"content":"..."}}] }         │
 * │                                                                      │
 * │  Usage in other services:                                            │
 * │      String reply = grokService.askAI(fullPrompt);                  │
 * │      if (reply != null) { use it } else { use built-in fallback }   │
 * │                                                                      │
 * │  Safety:                                                             │
 * │    - Returns null on ANY failure (auth error, timeout, …)           │
 * │    - Callers must never throw on null — fall back to built-in engine │
 * └──────────────────────────────────────────────────────────────────────┘
 */
@Service
@Slf4j
public class GrokService {

    // ── Configuration (application.properties) ───────────────────────────────
    @Value("${grok.api-key:}")
    private String apiKey;

    @Value("${grok.model:grok-3-mini}")
    private String model;

    @Value("${grok.timeout-seconds:30}")
    private int timeoutSeconds;

    @Value("${grok.base-url:https://api.groq.com/openai}")
    private String baseUrl;

    // Single shared HttpClient
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    // ═════════════════════════════════════════════════════════════════════════
    //  PRIMARY PUBLIC METHOD
    //
    //  Accepts a fully-assembled prompt string.
    //  Returns the AI text response, or null if Grok is unavailable.
    //  null  →  caller falls back to built-in engine (ResponseBuilder)
    // ═════════════════════════════════════════════════════════════════════════
    public String askAI(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            log.warn("[Grok] askAI called with blank prompt — skipped");
            return null;
        }

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("[Grok] No API key configured — set grok.api-key in application.properties");
            return null;
        }

        String url = baseUrl + "/v1/chat/completions";
        log.debug("[Grok] POST {} | model={} | prompt-length={}", url, model, prompt.length());

        try {
            String requestBody = buildRequestJson(prompt);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .build();

            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                String text = extractContent(response.body());
                if (text != null && !text.isBlank()) {
                    text = stripThinkTags(text);
                    log.info("[Grok] ✅ OK — response length={}", text.length());
                    return text.trim();
                }
                log.warn("[Grok] HTTP 200 but empty content in response body");

            } else if (response.statusCode() == 401) {
                log.error("[Grok] HTTP 401 Unauthorized — check your API key");

            } else if (response.statusCode() == 429) {
                log.warn("[Grok] HTTP 429 Rate Limited — too many requests");

            } else {
                String snippet = response.body() == null ? "(no body)"
                        : response.body().substring(0, Math.min(300, response.body().length()));
                log.warn("[Grok] HTTP {} — {}", response.statusCode(), snippet);
            }

        } catch (java.net.ConnectException ce) {
            log.warn("[Grok] Connection failed to {} — check internet/firewall", baseUrl);

        } catch (java.net.http.HttpTimeoutException te) {
            log.warn("[Grok] Request timed out after {}s", timeoutSeconds);

        } catch (Exception ex) {
            log.error("[Grok] Unexpected error: {}", ex.getMessage(), ex);
        }

        return null; // signal to caller: use built-in fallback
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  HEALTH CHECK
    //  Checks if API key is configured and a quick request succeeds.
    // ─────────────────────────────────────────────────────────────────────────
    public boolean isAvailable() {
        if (apiKey == null || apiKey.isBlank()) return false;
        try {
            // Quick test with minimal prompt
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/v1/models"))
                    .header("Authorization", "Bearer " + apiKey)
                    .GET()
                    .timeout(Duration.ofSeconds(5))
                    .build();
            int status = httpClient.send(request, HttpResponse.BodyHandlers.discarding()).statusCode();
            boolean up = (status == 200);
            log.debug("[Grok] health-check → {}", up ? "UP" : "DOWN (HTTP " + status + ")");
            return up;
        } catch (Exception e) {
            log.debug("[Grok] health-check → DOWN ({})", e.getMessage());
            return false;
        }
    }

    /**
     * Fast availability check.
     * Returns true if API key is configured (assumes cloud API is always up).
     */
    public boolean isAvailableFast() {
        return apiKey != null && !apiKey.isBlank();
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * Builds the OpenAI-compatible JSON request body for Grok.
     *
     * {
     *   "model": "grok-3-mini",
     *   "messages": [
     *     {"role": "user", "content": "<prompt>"}
     *   ],
     *   "temperature": 0.7,
     *   "max_tokens": 2048
     * }
     */
    private String buildRequestJson(String prompt) {
        return "{"
                + "\"model\":" + toJsonString(model) + ","
                + "\"messages\":[{\"role\":\"user\",\"content\":" + toJsonString(prompt) + "}],"
                + "\"temperature\":0.7,"
                + "\"max_tokens\":2048"
                + "}";
    }

    /**
     * Extracts the assistant message content from OpenAI-compatible response:
     *
     * {
     *   "choices": [{
     *     "message": {
     *       "role": "assistant",
     *       "content": "Here is the answer..."
     *     }
     *   }]
     * }
     */
    private String extractContent(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            // Find "content":" in the response
            final String MARKER = "\"content\":\"";
            // Skip the first "content" if it's inside the request echo — 
            // look for it after "choices"
            int choicesIdx = json.indexOf("\"choices\"");
            if (choicesIdx < 0) {
                log.warn("[Grok] 'choices' key not found in response");
                return null;
            }

            int markerIndex = json.indexOf(MARKER, choicesIdx);
            if (markerIndex < 0) {
                // Try alternate format: "content": " (with space after colon)
                final String MARKER2 = "\"content\": \"";
                markerIndex = json.indexOf(MARKER2, choicesIdx);
                if (markerIndex < 0) {
                    log.warn("[Grok] 'content' key not found after 'choices' in JSON");
                    return null;
                }
                markerIndex += MARKER2.length();
            } else {
                markerIndex += MARKER.length();
            }

            StringBuilder sb = new StringBuilder();
            boolean escaped = false;

            for (int i = markerIndex; i < json.length(); i++) {
                char c = json.charAt(i);
                if (escaped) {
                    switch (c) {
                        case 'n'  -> sb.append('\n');
                        case 't'  -> sb.append('\t');
                        case 'r'  -> { /* skip \r */ }
                        case '"'  -> sb.append('"');
                        case '\\' -> sb.append('\\');
                        case 'u'  -> {
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
                        default   -> sb.append(c);
                    }
                    escaped = false;
                } else if (c == '\\') {
                    escaped = true;
                } else if (c == '"') {
                    break; // closing quote
                } else {
                    sb.append(c);
                }
            }
            return sb.toString();

        } catch (Exception e) {
            log.error("[Grok] Failed to parse JSON response: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Wraps a Java string as a JSON string literal with proper escaping.
     */
    private String toJsonString(String value) {
        if (value == null) return "\"\"";
        return "\""
                + value
                    .replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "")
                    .replace("\t", "\\t")
                + "\"";
    }

    /**
     * Strips <think>...</think> reasoning blocks produced by Qwen and similar models.
     * These blocks contain the model's internal chain-of-thought and should not
     * be shown to end users.
     */
    private String stripThinkTags(String text) {
        if (text == null) return null;
        // Remove <think>...</think> blocks (including multiline)
        String cleaned = text.replaceAll("(?s)<think>.*?</think>", "").trim();
        // Also handle unclosed <think> tags (model cut off mid-thought)
        int thinkStart = cleaned.indexOf("<think>");
        if (thinkStart >= 0) {
            cleaned = cleaned.substring(0, thinkStart).trim();
        }
        return cleaned.isBlank() ? text.trim() : cleaned;
    }
}

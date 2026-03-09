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
 * │              OllamaService — Local AI via Ollama                     │
 * │                                                                      │
 * │  Replaces ALL OpenAI HTTP calls with calls to the local              │
 * │  Ollama REST endpoint:  http://localhost:11434/api/generate          │
 * │                                                                      │
 * │  Request  →  POST /api/generate                                      │
 * │              { "model": "llama3",                                    │
 * │                "prompt": "...",                                      │
 * │                "stream": false }                                     │
 * │                                                                      │
 * │  Response →  { "response": "...", "done": true, ... }               │
 * │                                                                      │
 * │  Usage in other services:                                            │
 * │      String reply = ollamaService.askAI(fullPrompt);                 │
 * │      if (reply != null) { use it } else { use built-in fallback }   │
 * │                                                                      │
 * │  Safety:                                                             │
 * │    - Returns null on ANY failure (connection refused, timeout, …)   │
 * │    - Callers must never throw on null — fall back to built-in engine │
 * └──────────────────────────────────────────────────────────────────────┘
 */
@Service
@Slf4j
public class OllamaService {

    // ── Configuration (application.properties) ───────────────────────────────
    @Value("${ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ollama.model:llama3}")
    private String ollamaModel;

    // Ollama can be slow on first call while the model loads — use generous timeout
    @Value("${ollama.timeout-seconds:60}")
    private int timeoutSeconds;

    // Single shared HttpClient — connect timeout is short (fail-fast if Ollama is down)
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    // ═════════════════════════════════════════════════════════════════════════
    //  PRIMARY PUBLIC METHOD
    //
    //  Accepts a fully-assembled prompt string.
    //  Returns the AI text response, or null if Ollama is unavailable.
    //  null  →  caller falls back to built-in engine (ResponseBuilder)
    // ═════════════════════════════════════════════════════════════════════════
    public String askAI(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            log.warn("[Ollama] askAI called with blank prompt — skipped");
            return null;
        }

        String url = ollamaBaseUrl + "/api/generate";
        log.debug("[Ollama] POST {} | model={} | prompt-length={}", url, ollamaModel, prompt.length());

        try {
            String requestBody = buildRequestJson(prompt);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .build();

            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                String text = extractResponseField(response.body());
                if (text != null && !text.isBlank()) {
                    log.info("[Ollama] ✅ OK — response length={}", text.length());
                    return text.trim();
                }
                log.warn("[Ollama] HTTP 200 but empty 'response' field in body");

            } else {
                // Log the beginning of the error body for diagnostics
                String snippet = response.body() == null ? "(no body)"
                        : response.body().substring(0, Math.min(200, response.body().length()));
                log.warn("[Ollama] HTTP {} — {}", response.statusCode(), snippet);
            }

        } catch (java.net.ConnectException ce) {
            // Most common case — Ollama not started yet
            log.warn("[Ollama] Connection refused at {} — start Ollama with: ollama serve", ollamaBaseUrl);

        } catch (java.net.http.HttpTimeoutException te) {
            log.warn("[Ollama] Request timed out after {}s — model may still be loading", timeoutSeconds);

        } catch (Exception ex) {
            log.error("[Ollama] Unexpected error: {}", ex.getMessage(), ex);
        }

        return null; // signal to caller: use built-in fallback
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  HEALTH CHECK
    //  Pings GET /api/tags — returns true if Ollama is reachable.
    //  Called from chat() response to set the aiPowered flag.
    // ─────────────────────────────────────────────────────────────────────────
    public boolean isAvailable() {
        try {
            HttpRequest ping = HttpRequest.newBuilder()
                    .uri(URI.create(ollamaBaseUrl + "/api/tags"))
                    .GET()
                    .timeout(Duration.ofSeconds(3))
                    .build();
            int status = httpClient.send(ping, HttpResponse.BodyHandlers.discarding()).statusCode();
            boolean up = (status == 200);
            log.debug("[Ollama] health-check → {}", up ? "UP" : "DOWN (HTTP " + status + ")");
            return up;
        } catch (Exception e) {
            log.debug("[Ollama] health-check → DOWN ({})", e.getMessage());
            return false;
        }
    }

    /**
     * Fast non-blocking availability check.
     * Returns false immediately if connection is refused (Ollama not running).
     * Uses 2s timeout instead of 3s to keep the chat response snappy.
     */
    public boolean isAvailableFast() {
        try {
            HttpRequest ping = HttpRequest.newBuilder()
                    .uri(URI.create(ollamaBaseUrl + "/api/tags"))
                    .GET()
                    .timeout(Duration.ofSeconds(2))
                    .build();
            int status = httpClient.send(ping, HttpResponse.BodyHandlers.discarding()).statusCode();
            return status == 200;
        } catch (Exception e) {
            return false;
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ═════════════════════════════════════════════════════════════════════════

    /**
     * Builds the Ollama JSON request body.
     *
     * {
     *   "model":  "llama3",
     *   "prompt": "<escaped prompt>",
     *   "stream": false
     * }
     *
     * stream=false → single HTTP response with complete text (no SSE parsing needed).
     */
    private String buildRequestJson(String prompt) {
        return "{"
                + "\"model\":"  + toJsonString(ollamaModel) + ","
                + "\"prompt\":" + toJsonString(prompt)      + ","
                + "\"stream\":false"
                + "}";
    }

    /**
     * Manually extracts the value of the "response" key from Ollama's JSON reply.
     *
     * Ollama response shape (stream=false):
     * {
     *   "model":              "llama3",
     *   "created_at":         "...",
     *   "response":           "Here is the AI-generated text...",
     *   "done":               true,
     *   "total_duration":     ...,
     *   ...
     * }
     *
     * Manual parsing avoids pulling in Jackson as a dependency in this service.
     */
    private String extractResponseField(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            final String MARKER = "\"response\":\"";
            int markerIndex = json.indexOf(MARKER);
            if (markerIndex < 0) {
                log.warn("[Ollama] 'response' key not found in JSON: {}",
                        json.substring(0, Math.min(300, json.length())));
                return null;
            }

            int start = markerIndex + MARKER.length();
            StringBuilder sb = new StringBuilder();
            boolean escaped = false;

            for (int i = start; i < json.length(); i++) {
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
                    break; // closing quote of "response" value
                } else {
                    sb.append(c);
                }
            }
            return sb.toString();

        } catch (Exception e) {
            log.error("[Ollama] Failed to parse JSON response: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Wraps a Java string as a JSON string literal with proper escaping.
     * Handles: backslash, double-quote, newline, carriage-return, tab.
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
}
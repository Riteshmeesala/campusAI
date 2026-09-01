package com.campusiq.ai.dto;

import jakarta.validation.constraints.NotBlank;

public class BroadcastEmailRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message is required")
    private String message;

    private String targetRole = "ALL";

    public BroadcastEmailRequest() {}

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
}

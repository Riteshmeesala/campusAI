package com.campusiq.dto.request;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class BroadcastEmailRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message is required")
    private String message;

    // Optional: "ALL" | "STUDENTS" | "FACULTY" — defaults to ALL
    private String targetRole;
}

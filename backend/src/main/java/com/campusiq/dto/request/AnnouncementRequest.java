package com.campusiq.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Data
public class AnnouncementRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Body is required")
    private String body;

    /** HOLIDAY | EXAM | EVENT | GENERAL | RESULT */
    private String type = "GENERAL";

    /** null = all students; else specific user IDs */
    private List<Long> targetUserIds;

    private boolean sendEmail = true;
    private boolean saveNotification = true;
}

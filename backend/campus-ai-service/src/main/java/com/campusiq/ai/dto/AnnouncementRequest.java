package com.campusiq.ai.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class AnnouncementRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Body is required")
    private String body;

    private String type = "GENERAL";
    private boolean sendEmail = true;
    private boolean saveNotification = true;
    private List<Long> targetUserIds;

    public AnnouncementRequest() {}

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public boolean isSendEmail() { return sendEmail; }
    public void setSendEmail(boolean sendEmail) { this.sendEmail = sendEmail; }
    public boolean isSaveNotification() { return saveNotification; }
    public void setSaveNotification(boolean saveNotification) { this.saveNotification = saveNotification; }
    public List<Long> getTargetUserIds() { return targetUserIds; }
    public void setTargetUserIds(List<Long> targetUserIds) { this.targetUserIds = targetUserIds; }
}

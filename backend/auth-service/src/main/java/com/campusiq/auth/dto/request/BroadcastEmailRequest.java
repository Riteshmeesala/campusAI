package com.campusiq.auth.dto.request;

public class BroadcastEmailRequest {
    private String subject;
    private String message;
    private String targetRole;
    private String department;

    public BroadcastEmailRequest() {}

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}

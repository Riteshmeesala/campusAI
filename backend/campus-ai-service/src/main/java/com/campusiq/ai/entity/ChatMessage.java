package com.campusiq.ai.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages", indexes = {
        @Index(name = "idx_chat_user_session", columnList = "user_id, session_id"),
        @Index(name = "idx_chat_created", columnList = "created_at")
})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "session_id", nullable = false, length = 100)
    private String sessionId;

    @Column(nullable = false, length = 20)
    private String role;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "db_context", columnDefinition = "TEXT")
    private String dbContext;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ChatMessage() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getDbContext() { return dbContext; }
    public void setDbContext(String dbContext) { this.dbContext = dbContext; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final ChatMessage msg = new ChatMessage();
        public Builder id(Long id) { msg.setId(id); return this; }
        public Builder userId(Long uid) { msg.setUserId(uid); return this; }
        public Builder sessionId(String sid) { msg.setSessionId(sid); return this; }
        public Builder role(String r) { msg.setRole(r); return this; }
        public Builder content(String c) { msg.setContent(c); return this; }
        public Builder dbContext(String db) { msg.setDbContext(db); return this; }
        public ChatMessage build() { return msg; }
    }
}

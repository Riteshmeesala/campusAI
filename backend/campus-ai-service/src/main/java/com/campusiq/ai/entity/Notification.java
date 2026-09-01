package com.campusiq.ai.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notif_user", columnList = "user_id"),
        @Index(name = "idx_notif_read", columnList = "is_read")
})
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(name = "is_read")
    private boolean read = false;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        ATTENDANCE, FEE_REMINDER, EXAM_SCHEDULE,
        RESULT_PUBLISHED, MID_RESULT_PUBLISHED, SEM_RESULT_PUBLISHED,
        GENERAL, SYSTEM, PAYMENT_SUCCESS, PAYMENT_FAILED,
        HOLIDAY, EVENT
    }

    public Notification() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }
    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final Notification n = new Notification();
        public Builder id(Long id) { n.setId(id); return this; }
        public Builder user(User u) { n.setUser(u); return this; }
        public Builder title(String t) { n.setTitle(t); return this; }
        public Builder message(String m) { n.setMessage(m); return this; }
        public Builder type(NotificationType t) { n.setType(t); return this; }
        public Builder read(boolean r) { n.setRead(r); return this; }
        public Builder referenceId(Long rid) { n.setReferenceId(rid); return this; }
        public Builder referenceType(String rt) { n.setReferenceType(rt); return this; }
        public Notification build() { return n; }
    }
}

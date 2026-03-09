package com.campusiq.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notif_user", columnList = "user_id"),
    @Index(name = "idx_notif_read", columnList = "is_read")
})
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Notification {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"attendances","fees","results","password","otpCode","fcmToken",
                            "twoFactorEnabled","hibernateLazyInitializer","handler"})
    private User user;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Builder.Default
    @Column(name = "is_read")
    private boolean read = false;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // ✅ UPDATED: Added HOLIDAY, EVENT, MID_RESULT, SEM_RESULT types
    public enum NotificationType {
        ATTENDANCE, FEE_REMINDER, EXAM_SCHEDULE,
        RESULT_PUBLISHED, MID_RESULT_PUBLISHED, SEM_RESULT_PUBLISHED,
        GENERAL, SYSTEM, PAYMENT_SUCCESS, PAYMENT_FAILED,
        HOLIDAY,    // ✅ NEW
        EVENT       // ✅ NEW
    }
}

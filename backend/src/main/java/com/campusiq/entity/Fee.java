package com.campusiq.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fees", indexes = {
    @Index(name = "idx_fees_student", columnList = "student_id"),
    @Index(name = "idx_fees_status",  columnList = "status")
})
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Fee {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"attendances","fees","results","password","otpCode","fcmToken",
                            "twoFactorEnabled","hibernateLazyInitializer","handler"})
    private User student;

    @Column(name = "fee_type", nullable = false, length = 100)
    private String feeType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private FeeStatus status = FeeStatus.PENDING;

    @Column(name = "razorpay_order_id",  length = 200)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 200)
    private String razorpayPaymentId;

    @Column(length = 500)
    private String description;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(name = "semester", length = 20)
    private String semester;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum FeeStatus { PENDING, PAID, OVERDUE, CANCELLED, REFUNDED }
}

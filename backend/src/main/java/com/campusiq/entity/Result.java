package com.campusiq.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "results", indexes = {
    @Index(name = "idx_results_student", columnList = "student_id"),
    @Index(name = "idx_results_exam",    columnList = "exam_id"),
    @Index(name = "idx_results_type",    columnList = "result_type")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uq_result_student_exam", columnNames = {"student_id","exam_id"})
})
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Result {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"attendances","fees","results","password","otpCode","fcmToken",
                            "twoFactorEnabled","hibernateLazyInitializer","handler"})
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exam_id", nullable = false)
    @JsonIgnoreProperties({"results","hibernateLazyInitializer","handler"})
    private Exam exam;

    /** MID = faculty publishes mid-semester | SEM = admin publishes end-semester */
    @Column(name = "result_type", nullable = false, length = 10)
    @Builder.Default
    private String resultType = "MID";

    @Column(name = "marks_obtained", nullable = false, precision = 6, scale = 2)
    private BigDecimal marksObtained;

    @Column(name = "percentage", precision = 5, scale = 2)
    private BigDecimal percentage;

    @Column(name = "grade_points", precision = 4, scale = 2)
    private BigDecimal gradePoints;

    @Column(length = 5)
    private String grade;

    @Column(name = "is_pass")
    private Boolean pass;

    @Column(length = 500)
    private String remarks;

    @Column(name = "published_by")
    private Long publishedBy;   // user id of faculty/admin who published

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
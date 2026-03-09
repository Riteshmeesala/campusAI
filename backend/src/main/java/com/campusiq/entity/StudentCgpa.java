package com.campusiq.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Stores official CGPA/SGPA values published by an Admin.
 * One record per student per batch (identified by publishedBy + createdAt).
 * If semester is null → it is a cumulative CGPA record.
 * If semester is set  → it is an SGPA record for that semester.
 */
@Entity
@Table(name = "student_cgpa", indexes = {
    @Index(name = "idx_cgpa_student", columnList = "student_id"),
    @Index(name = "idx_cgpa_sem",     columnList = "semester")
})
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StudentCgpa {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"attendances","fees","results","password","otpCode",
                            "fcmToken","twoFactorEnabled","hibernateLazyInitializer","handler"})
    private User student;

    /** Null = cumulative CGPA; non-null = SGPA for the given semester */
    @Column(name = "semester")
    private Integer semester;

    /** The CGPA/SGPA value on a 10-point scale */
    @Column(name = "cgpa_value", nullable = false, precision = 4, scale = 2)
    private BigDecimal cgpaValue;

    /** Admin user-id who published this record */
    @Column(name = "published_by", nullable = false)
    private Long publishedBy;

    @Column(length = 500)
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
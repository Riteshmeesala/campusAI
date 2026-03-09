package com.campusiq.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance", indexes = {
    @Index(name = "idx_att_student", columnList = "student_id"),
    @Index(name = "idx_att_course",  columnList = "course_id"),
    @Index(name = "idx_att_date",    columnList = "attendance_date")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uq_att_student_course_date",
        columnNames = {"student_id","course_id","attendance_date"})
})
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Attendance {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"attendances","fees","results","password","otpCode","fcmToken",
                            "twoFactorEnabled","hibernateLazyInitializer","handler"})
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({"attendances","exams","hibernateLazyInitializer","handler"})
    private Course course;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AttendanceStatus status;

    @Column(length = 200)
    private String remarks;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marked_by")
    private User markedBy;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum AttendanceStatus { PRESENT, ABSENT, LATE, EXCUSED }
}

package com.campusiq.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "exams", indexes = {
    @Index(name = "idx_exams_course",  columnList = "course_id"),
    @Index(name = "idx_exams_date",    columnList = "scheduled_date")
})
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Exam {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_name", nullable = false, length = 200)
    private String examName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({"attendances","exams","hibernateLazyInitializer","handler"})
    private Course course;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDateTime scheduledDate;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "total_marks", nullable = false)
    private Integer totalMarks;

    @Column(name = "passing_marks", nullable = false)
    private Integer passingMarks;

    @Column(length = 200)
    private String venue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ExamStatus status = ExamStatus.SCHEDULED;

    @Column(length = 500)
    private String description;

    @Column(name = "semester")
    @Builder.Default
    private Integer semester = 4;

    @Column(name = "exam_type", length = 50)
    @Builder.Default
    private String examType = "MID_SEM";

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default private List<Result> results = new ArrayList<>();

    public enum ExamStatus { SCHEDULED, ONGOING, COMPLETED, CANCELLED }
}

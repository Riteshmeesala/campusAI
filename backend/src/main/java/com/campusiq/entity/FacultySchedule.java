package com.campusiq.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "faculty_schedules", indexes = {
    @Index(name = "idx_fschedule_faculty", columnList = "faculty_id"),
    @Index(name = "idx_fschedule_course",  columnList = "course_id"),
    @Index(name = "idx_fschedule_date",    columnList = "schedule_date")
})
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FacultySchedule {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    @JsonIgnoreProperties({"attendances","fees","results","password","otpCode","fcmToken",
                            "twoFactorEnabled","hibernateLazyInitializer","handler"})
    private User faculty;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private Course course;

    @Column(name = "schedule_date", nullable = false)
    private LocalDate scheduleDate;

    @Column(name = "topic_covered", nullable = false, length = 300)
    private String topicCovered;

    @Column(name = "sub_topics", length = 1000)
    private String subTopics;

    @Column(name = "chapter_number", length = 20)
    private String chapterNumber;

    @Column(name = "duration_hours")
    private Double durationHours;

    @Column(name = "teaching_method", length = 100)
    private String teachingMethod; // Lecture, Lab, Tutorial, Seminar

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "class_period", length = 10)
    private String classPeriod; // 1st, 2nd, 3rd period etc

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

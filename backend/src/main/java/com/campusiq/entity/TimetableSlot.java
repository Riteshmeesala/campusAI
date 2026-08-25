package com.campusiq.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "timetable_slots", indexes = {
    @Index(name = "idx_ts_faculty", columnList = "faculty_id"),
    @Index(name = "idx_ts_course",  columnList = "course_id"),
    @Index(name = "idx_ts_day",     columnList = "day_of_week")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimetableSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    @JsonIgnoreProperties({"attendances","fees","results","password","otpCode","fcmToken",
                            "twoFactorEnabled","hibernateLazyInitializer","handler","courses"})
    private User faculty;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler","attendances","exams"})
    private Course course;

    @Column(name = "day_of_week", nullable = false, length = 20)
    private String dayOfWeek; // MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY

    @Column(name = "start_time", nullable = false, length = 20)
    private String startTime; // e.g. "09:00 AM" or "09:00"

    @Column(name = "end_time", nullable = false, length = 20)
    private String endTime; // e.g. "10:00 AM" or "10:00"

    @Column(name = "period_name", length = 30)
    private String periodName; // e.g. "Period 1", "Slot A"

    @Column(name = "room_no", length = 50)
    private String roomNo; // e.g. "LH-101", "CS-Lab 2"

    @Column(name = "section_name", length = 50)
    private String sectionName; // e.g. "CSE-A", "Section 1", "Year 3"

    @Column(name = "class_type", length = 30)
    @Builder.Default
    private String classType = "Lecture"; // Lecture, Lab, Tutorial, Seminar

    @Column(name = "color_code", length = 20)
    private String colorCode; // e.g. "#3b82f6"

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

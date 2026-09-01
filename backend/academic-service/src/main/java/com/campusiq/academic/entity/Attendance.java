package com.campusiq.academic.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance", indexes = {
        @Index(name = "idx_att_student", columnList = "student_id"),
        @Index(name = "idx_att_course", columnList = "course_id"),
        @Index(name = "idx_att_date", columnList = "attendance_date")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uq_att_student_course_date", columnNames = {"student_id", "course_id", "attendance_date"})
})
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Course course;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AttendanceStatus status;

    @Column(length = 200)
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marked_by")
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User markedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum AttendanceStatus {
        PRESENT, ABSENT, LATE, EXCUSED
    }

    public Attendance() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }
    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public User getMarkedBy() { return markedBy; }
    public void setMarkedBy(User markedBy) { this.markedBy = markedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final Attendance att = new Attendance();
        public Builder id(Long id) { att.setId(id); return this; }
        public Builder student(User student) { att.setStudent(student); return this; }
        public Builder course(Course course) { att.setCourse(course); return this; }
        public Builder attendanceDate(LocalDate date) { att.setAttendanceDate(date); return this; }
        public Builder status(AttendanceStatus status) { att.setStatus(status); return this; }
        public Builder remarks(String remarks) { att.setRemarks(remarks); return this; }
        public Builder markedBy(User markedBy) { att.setMarkedBy(markedBy); return this; }
        public Attendance build() { return att; }
    }
}

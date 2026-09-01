package com.campusiq.assessment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exams", indexes = {
        @Index(name = "idx_exams_course", columnList = "course_id"),
        @Index(name = "idx_exams_date", columnList = "scheduled_date")
})
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_name", nullable = false, length = 200)
    private String examName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    private ExamStatus status = ExamStatus.SCHEDULED;

    @Column(length = 500)
    private String description;

    @Column(name = "semester")
    private Integer semester = 4;

    @Column(name = "exam_type", length = 50)
    private String examType = "MID_SEM";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Result> results = new ArrayList<>();

    public enum ExamStatus {
        SCHEDULED, ONGOING, COMPLETED, CANCELLED
    }

    public Exam() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getExamName() { return examName; }
    public void setExamName(String examName) { this.examName = examName; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public LocalDateTime getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDateTime scheduledDate) { this.scheduledDate = scheduledDate; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }
    public Integer getPassingMarks() { return passingMarks; }
    public void setPassingMarks(Integer passingMarks) { this.passingMarks = passingMarks; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public ExamStatus getStatus() { return status; }
    public void setStatus(ExamStatus status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getExamType() { return examType; }
    public void setExamType(String examType) { this.examType = examType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<Result> getResults() { return results; }
    public void setResults(List<Result> results) { this.results = results; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final Exam exam = new Exam();
        public Builder id(Long id) { exam.setId(id); return this; }
        public Builder examName(String name) { exam.setExamName(name); return this; }
        public Builder course(Course course) { exam.setCourse(course); return this; }
        public Builder scheduledDate(LocalDateTime date) { exam.setScheduledDate(date); return this; }
        public Builder durationMinutes(Integer d) { exam.setDurationMinutes(d); return this; }
        public Builder totalMarks(Integer tm) { exam.setTotalMarks(tm); return this; }
        public Builder passingMarks(Integer pm) { exam.setPassingMarks(pm); return this; }
        public Builder venue(String v) { exam.setVenue(v); return this; }
        public Builder status(ExamStatus s) { exam.setStatus(s); return this; }
        public Builder description(String desc) { exam.setDescription(desc); return this; }
        public Builder semester(Integer sem) { exam.setSemester(sem); return this; }
        public Builder examType(String type) { exam.setExamType(type); return this; }
        public Exam build() { return exam; }
    }
}

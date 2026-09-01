package com.campusiq.academic.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "faculty_schedules", indexes = {
        @Index(name = "idx_fschedule_faculty", columnList = "faculty_id"),
        @Index(name = "idx_fschedule_course", columnList = "course_id"),
        @Index(name = "idx_fschedule_date", columnList = "schedule_date")
})
public class FacultySchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User faculty;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
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
    private String teachingMethod;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "class_period", length = 10)
    private String classPeriod;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public FacultySchedule() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getFaculty() { return faculty; }
    public void setFaculty(User faculty) { this.faculty = faculty; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public LocalDate getScheduleDate() { return scheduleDate; }
    public void setScheduleDate(LocalDate scheduleDate) { this.scheduleDate = scheduleDate; }
    public String getTopicCovered() { return topicCovered; }
    public void setTopicCovered(String topicCovered) { this.topicCovered = topicCovered; }
    public String getSubTopics() { return subTopics; }
    public void setSubTopics(String subTopics) { this.subTopics = subTopics; }
    public String getChapterNumber() { return chapterNumber; }
    public void setChapterNumber(String chapterNumber) { this.chapterNumber = chapterNumber; }
    public Double getDurationHours() { return durationHours; }
    public void setDurationHours(Double durationHours) { this.durationHours = durationHours; }
    public String getTeachingMethod() { return teachingMethod; }
    public void setTeachingMethod(String teachingMethod) { this.teachingMethod = teachingMethod; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getClassPeriod() { return classPeriod; }
    public void setClassPeriod(String classPeriod) { this.classPeriod = classPeriod; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final FacultySchedule s = new FacultySchedule();
        public Builder id(Long id) { s.setId(id); return this; }
        public Builder faculty(User f) { s.setFaculty(f); return this; }
        public Builder course(Course c) { s.setCourse(c); return this; }
        public Builder scheduleDate(LocalDate d) { s.setScheduleDate(d); return this; }
        public Builder topicCovered(String t) { s.setTopicCovered(t); return this; }
        public Builder subTopics(String st) { s.setSubTopics(st); return this; }
        public Builder chapterNumber(String ch) { s.setChapterNumber(ch); return this; }
        public Builder durationHours(Double dh) { s.setDurationHours(dh); return this; }
        public Builder teachingMethod(String tm) { s.setTeachingMethod(tm); return this; }
        public Builder remarks(String r) { s.setRemarks(r); return this; }
        public Builder classPeriod(String cp) { s.setClassPeriod(cp); return this; }
        public FacultySchedule build() { return s; }
    }
}

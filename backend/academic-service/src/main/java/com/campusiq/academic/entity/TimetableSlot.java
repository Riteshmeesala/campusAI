package com.campusiq.academic.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "timetable_slots", indexes = {
        @Index(name = "idx_ts_faculty", columnList = "faculty_id"),
        @Index(name = "idx_ts_course", columnList = "course_id"),
        @Index(name = "idx_ts_day", columnList = "day_of_week")
})
public class TimetableSlot {

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

    @Column(name = "day_of_week", nullable = false, length = 20)
    private String dayOfWeek;

    @Column(name = "start_time", nullable = false, length = 20)
    private String startTime;

    @Column(name = "end_time", nullable = false, length = 20)
    private String endTime;

    @Column(name = "period_name", length = 30)
    private String periodName;

    @Column(name = "room_no", length = 50)
    private String roomNo;

    @Column(name = "section_name", length = 50)
    private String sectionName;

    @Column(name = "class_type", length = 30)
    private String classType = "Lecture";

    @Column(name = "color_code", length = 20)
    private String colorCode;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public TimetableSlot() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getFaculty() { return faculty; }
    public void setFaculty(User faculty) { this.faculty = faculty; }
    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public String getPeriodName() { return periodName; }
    public void setPeriodName(String periodName) { this.periodName = periodName; }
    public String getRoomNo() { return roomNo; }
    public void setRoomNo(String roomNo) { this.roomNo = roomNo; }
    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }
    public String getClassType() { return classType; }
    public void setClassType(String classType) { this.classType = classType; }
    public String getColorCode() { return colorCode; }
    public void setColorCode(String colorCode) { this.colorCode = colorCode; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final TimetableSlot slot = new TimetableSlot();
        public Builder id(Long id) { slot.setId(id); return this; }
        public Builder faculty(User faculty) { slot.setFaculty(faculty); return this; }
        public Builder course(Course course) { slot.setCourse(course); return this; }
        public Builder dayOfWeek(String day) { slot.setDayOfWeek(day); return this; }
        public Builder startTime(String st) { slot.setStartTime(st); return this; }
        public Builder endTime(String et) { slot.setEndTime(et); return this; }
        public Builder periodName(String pn) { slot.setPeriodName(pn); return this; }
        public Builder roomNo(String room) { slot.setRoomNo(room); return this; }
        public Builder sectionName(String sec) { slot.setSectionName(sec); return this; }
        public Builder classType(String ct) { slot.setClassType(ct); return this; }
        public Builder colorCode(String cc) { slot.setColorCode(cc); return this; }
        public TimetableSlot build() { return slot; }
    }
}

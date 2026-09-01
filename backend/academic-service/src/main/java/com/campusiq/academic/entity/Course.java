package com.campusiq.academic.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "courses", indexes = {
        @Index(name = "idx_courses_code", columnList = "course_code", unique = true)
})
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_code", nullable = false, unique = true, length = 20)
    private String courseCode;

    @Column(name = "course_name", nullable = false, length = 200)
    private String courseName;

    @Column(length = 500)
    private String description;

    @Column(name = "credit_hours")
    private Integer creditHours;

    @Column(length = 100)
    private String department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id")
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User faculty;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Course() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getCreditHours() { return creditHours; }
    public void setCreditHours(Integer creditHours) { this.creditHours = creditHours; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public User getFaculty() { return faculty; }
    public void setFaculty(User faculty) { this.faculty = faculty; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final Course course = new Course();
        public Builder id(Long id) { course.setId(id); return this; }
        public Builder courseCode(String code) { course.setCourseCode(code); return this; }
        public Builder courseName(String name) { course.setCourseName(name); return this; }
        public Builder description(String desc) { course.setDescription(desc); return this; }
        public Builder creditHours(Integer ch) { course.setCreditHours(ch); return this; }
        public Builder department(String dept) { course.setDepartment(dept); return this; }
        public Builder faculty(User faculty) { course.setFaculty(faculty); return this; }
        public Course build() { return course; }
    }
}

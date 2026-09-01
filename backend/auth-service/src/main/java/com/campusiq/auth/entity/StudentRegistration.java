package com.campusiq.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_registrations", indexes = {
        @Index(name = "idx_reg_enroll", columnList = "enrollment_number", unique = true),
        @Index(name = "idx_reg_email", columnList = "email", unique = true),
        @Index(name = "idx_reg_user", columnList = "username", unique = true),
        @Index(name = "idx_reg_status", columnList = "status")
})
public class StudentRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "enrollment_number", nullable = false, unique = true, length = 50)
    private String enrollmentNumber;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(length = 100)
    private String course; // e.g. "B.Tech Computer Science"

    @Column(length = 20)
    private String year; // e.g. "1st Year"

    @Column(length = 20)
    private String semester; // e.g. "1-1"

    @Column(length = 50)
    private String section; // e.g. "Section A"

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @JsonIgnore
    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 20)
    private String status = "REGISTERED"; // REGISTERED, IMPORTED, APPROVED

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public StudentRegistration() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEnrollmentNumber() { return enrollmentNumber; }
    public void setEnrollmentNumber(String enrollmentNumber) { this.enrollmentNumber = enrollmentNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getCourse() { return course; }
    public void setCourse(String course) { this.course = course; }
    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final StudentRegistration reg = new StudentRegistration();
        public Builder id(Long id) { reg.setId(id); return this; }
        public Builder name(String name) { reg.setName(name); return this; }
        public Builder enrollmentNumber(String en) { reg.setEnrollmentNumber(en); return this; }
        public Builder email(String email) { reg.setEmail(email); return this; }
        public Builder phoneNumber(String phone) { reg.setPhoneNumber(phone); return this; }
        public Builder department(String dept) { reg.setDepartment(dept); return this; }
        public Builder course(String course) { reg.setCourse(course); return this; }
        public Builder year(String year) { reg.setYear(year); return this; }
        public Builder semester(String sem) { reg.setSemester(sem); return this; }
        public Builder section(String sec) { reg.setSection(sec); return this; }
        public Builder username(String username) { reg.setUsername(username); return this; }
        public Builder password(String password) { reg.setPassword(password); return this; }
        public Builder status(String status) { reg.setStatus(status); return this; }
        public StudentRegistration build() { return reg; }
    }
}

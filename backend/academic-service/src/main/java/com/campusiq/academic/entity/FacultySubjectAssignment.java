package com.campusiq.academic.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "faculty_subject_assignments", indexes = {
        @Index(name = "idx_fassign_faculty", columnList = "faculty_id"),
        @Index(name = "idx_fassign_dept", columnList = "department"),
        @Index(name = "idx_fassign_sem", columnList = "semester_code")
})
public class FacultySubjectAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User faculty;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(name = "subject_code", nullable = false, length = 30)
    private String subjectCode;

    @Column(name = "subject_name", nullable = false, length = 200)
    private String subjectName;

    @Column(name = "semester_code", nullable = false, length = 10)
    private String semesterCode; // e.g. '1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2'

    @Column(name = "academic_year", length = 50)
    private String academicYear; // e.g. '2025-2026' or '3rd Year'

    @Column(name = "section", length = 50)
    private String section; // e.g. 'Section A'

    @Column(name = "credit_hours")
    private Integer creditHours = 3;

    @Column(name = "is_active")
    private Boolean active = true;

    @Column(name = "assigned_by")
    private Long assignedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public FacultySubjectAssignment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getFaculty() { return faculty; }
    public void setFaculty(User faculty) { this.faculty = faculty; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }
    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }
    public String getSemesterCode() { return semesterCode; }
    public void setSemesterCode(String semesterCode) { this.semesterCode = semesterCode; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public Integer getCreditHours() { return creditHours; }
    public void setCreditHours(Integer creditHours) { this.creditHours = creditHours; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Long getAssignedBy() { return assignedBy; }
    public void setAssignedBy(Long assignedBy) { this.assignedBy = assignedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final FacultySubjectAssignment a = new FacultySubjectAssignment();
        public Builder id(Long id) { a.setId(id); return this; }
        public Builder faculty(User f) { a.setFaculty(f); return this; }
        public Builder department(String d) { a.setDepartment(d); return this; }
        public Builder subjectCode(String sc) { a.setSubjectCode(sc); return this; }
        public Builder subjectName(String sn) { a.setSubjectName(sn); return this; }
        public Builder semesterCode(String sem) { a.setSemesterCode(sem); return this; }
        public Builder academicYear(String ay) { a.setAcademicYear(ay); return this; }
        public Builder section(String s) { a.setSection(s); return this; }
        public Builder creditHours(Integer ch) { a.setCreditHours(ch); return this; }
        public Builder active(Boolean act) { a.setActive(act); return this; }
        public Builder assignedBy(Long ab) { a.setAssignedBy(ab); return this; }
        public FacultySubjectAssignment build() { return a; }
    }
}

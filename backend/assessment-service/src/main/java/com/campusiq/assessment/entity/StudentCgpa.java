package com.campusiq.assessment.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_cgpa", indexes = {
        @Index(name = "idx_cgpa_student", columnList = "student_id"),
        @Index(name = "idx_cgpa_sem", columnList = "semester")
})
public class StudentCgpa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User student;

    @Column(name = "semester")
    private Integer semester;

    @Column(name = "cgpa_value", nullable = false, precision = 4, scale = 2)
    private BigDecimal cgpaValue;

    @Column(name = "published_by", nullable = false)
    private Long publishedBy;

    @Column(length = 500)
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public StudentCgpa() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public BigDecimal getCgpaValue() { return cgpaValue; }
    public void setCgpaValue(BigDecimal cgpaValue) { this.cgpaValue = cgpaValue; }
    public Long getPublishedBy() { return publishedBy; }
    public void setPublishedBy(Long publishedBy) { this.publishedBy = publishedBy; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final StudentCgpa c = new StudentCgpa();
        public Builder id(Long id) { c.setId(id); return this; }
        public Builder student(User s) { c.setStudent(s); return this; }
        public Builder semester(Integer sem) { c.setSemester(sem); return this; }
        public Builder cgpaValue(BigDecimal val) { c.setCgpaValue(val); return this; }
        public Builder publishedBy(Long p) { c.setPublishedBy(p); return this; }
        public Builder remarks(String r) { c.setRemarks(r); return this; }
        public StudentCgpa build() { return c; }
    }
}

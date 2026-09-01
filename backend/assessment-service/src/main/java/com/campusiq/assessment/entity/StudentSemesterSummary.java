package com.campusiq.assessment.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_semester_summaries", indexes = {
        @Index(name = "idx_sum_student", columnList = "student_id"),
        @Index(name = "idx_sum_sem_code", columnList = "semester_code")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uq_student_sem_summary", columnNames = {"student_id", "semester_code"})
})
public class StudentSemesterSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User student;

    @Column(name = "semester_code", nullable = false, length = 10)
    private String semesterCode; // e.g. "1-1", "1-2", "2-1", "2-2", "3-1", "3-2", "4-1", "4-2"

    @Column(name = "semester_num", nullable = false)
    private Integer semesterNum; // 1 to 8

    @Column(name = "sgpa", precision = 4, scale = 2)
    private BigDecimal sgpa = BigDecimal.valueOf(8.25);

    @Column(name = "cgpa", precision = 4, scale = 2)
    private BigDecimal cgpa = BigDecimal.valueOf(8.25);

    @Column(name = "total_credits")
    private Integer totalCredits = 20;

    @Column(name = "earned_credits")
    private Integer earnedCredits = 20;

    @Column(name = "attendance_percentage", precision = 5, scale = 2)
    private BigDecimal attendancePercentage = BigDecimal.valueOf(88.50);

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "updated_by")
    private Long updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public StudentSemesterSummary() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public String getSemesterCode() { return semesterCode; }
    public void setSemesterCode(String semesterCode) { this.semesterCode = semesterCode; }
    public Integer getSemesterNum() { return semesterNum; }
    public void setSemesterNum(Integer semesterNum) { this.semesterNum = semesterNum; }
    public BigDecimal getSgpa() { return sgpa; }
    public void setSgpa(BigDecimal sgpa) { this.sgpa = sgpa; }
    public BigDecimal getCgpa() { return cgpa; }
    public void setCgpa(BigDecimal cgpa) { this.cgpa = cgpa; }
    public Integer getTotalCredits() { return totalCredits; }
    public void setTotalCredits(Integer totalCredits) { this.totalCredits = totalCredits; }
    public Integer getEarnedCredits() { return earnedCredits; }
    public void setEarnedCredits(Integer earnedCredits) { this.earnedCredits = earnedCredits; }
    public BigDecimal getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(BigDecimal attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public Long getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(Long updatedBy) { this.updatedBy = updatedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final StudentSemesterSummary s = new StudentSemesterSummary();
        public Builder id(Long id) { s.setId(id); return this; }
        public Builder student(User st) { s.setStudent(st); return this; }
        public Builder semesterCode(String sc) { s.setSemesterCode(sc); return this; }
        public Builder semesterNum(Integer sn) { s.setSemesterNum(sn); return this; }
        public Builder sgpa(BigDecimal sgpa) { s.setSgpa(sgpa); return this; }
        public Builder cgpa(BigDecimal cgpa) { s.setCgpa(cgpa); return this; }
        public Builder totalCredits(Integer tc) { s.setTotalCredits(tc); return this; }
        public Builder earnedCredits(Integer ec) { s.setEarnedCredits(ec); return this; }
        public Builder attendancePercentage(BigDecimal att) { s.setAttendancePercentage(att); return this; }
        public Builder remarks(String rem) { s.setRemarks(rem); return this; }
        public Builder updatedBy(Long ub) { s.setUpdatedBy(ub); return this; }
        public StudentSemesterSummary build() { return s; }
    }
}

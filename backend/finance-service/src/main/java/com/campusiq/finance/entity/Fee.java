package com.campusiq.finance.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fees", indexes = {
        @Index(name = "idx_fees_student", columnList = "student_id"),
        @Index(name = "idx_fees_status", columnList = "status")
})
public class Fee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"password", "hibernateLazyInitializer", "handler"})
    private User student;

    @Column(name = "fee_type", nullable = false, length = 100)
    private String feeType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FeeStatus status = FeeStatus.PENDING;

    @Column(name = "razorpay_order_id", length = 200)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", length = 200)
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature", length = 500)
    private String razorpaySignature;

    @Column(length = 500)
    private String description;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(name = "semester", length = 20)
    private String semester;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum FeeStatus {
        PENDING, PAID, OVERDUE, CANCELLED, REFUNDED
    }

    public Fee() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
    public String getFeeType() { return feeType; }
    public void setFeeType(String feeType) { this.feeType = feeType; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }
    public FeeStatus getStatus() { return status; }
    public void setStatus(FeeStatus status) { this.status = status; }
    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final Fee fee = new Fee();
        public Builder id(Long id) { fee.setId(id); return this; }
        public Builder student(User s) { fee.setStudent(s); return this; }
        public Builder feeType(String ft) { fee.setFeeType(ft); return this; }
        public Builder amount(BigDecimal a) { fee.setAmount(a); return this; }
        public Builder dueDate(LocalDate dd) { fee.setDueDate(dd); return this; }
        public Builder paidDate(LocalDate pd) { fee.setPaidDate(pd); return this; }
        public Builder status(FeeStatus s) { fee.setStatus(s); return this; }
        public Builder razorpayOrderId(String oid) { fee.setRazorpayOrderId(oid); return this; }
        public Builder razorpayPaymentId(String pid) { fee.setRazorpayPaymentId(pid); return this; }
        public Builder razorpaySignature(String sig) { fee.setRazorpaySignature(sig); return this; }
        public Builder description(String d) { fee.setDescription(d); return this; }
        public Builder academicYear(String ay) { fee.setAcademicYear(ay); return this; }
        public Builder semester(String sem) { fee.setSemester(sem); return this; }
        public Fee build() { return fee; }
    }
}

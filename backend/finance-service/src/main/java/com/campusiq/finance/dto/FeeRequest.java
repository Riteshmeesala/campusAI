package com.campusiq.finance.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class FeeRequest {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Fee type is required")
    private String feeType;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "1.0", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    private String description;
    private String academicYear;
    private String semester;

    public FeeRequest() {}

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getFeeType() { return feeType; }
    public void setFeeType(String feeType) { this.feeType = feeType; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }
}

package com.campusiq.dto.request;

import lombok.Data;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FeeRequest {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Fee type is required")
    @Size(max = 100)
    private String feeType;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @Size(max = 500)
    private String description;

    @Size(max = 20)
    private String academicYear;

    @Size(max = 20)
    private String semester;
}

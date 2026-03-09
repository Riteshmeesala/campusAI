package com.campusiq.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;

/**
 * Request body for Admin-only CGPA bulk publish.
 * studentCgpaMap: { studentId -> cgpa value (0.00 – 10.00) }
 * semester: optional; if provided, value is treated as SGPA for that semester.
 * remarks: optional note attached to every record.
 */
@Data
public class CgpaUploadRequest {

    /** Map of studentId → CGPA value */
    @NotNull(message = "Student CGPA map is required")
    private Map<Long, BigDecimal> studentCgpaMap;

    /** Optional semester number (1-8). When present → SGPA upload for that semester */
    private Integer semester;

    /** Optional remarks / note for this upload batch */
    private String remarks;
}
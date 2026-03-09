package com.campusiq.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class ResultRequest {

    @NotNull(message = "Exam ID is required")
    private Long examId;

    @NotNull(message = "Student marks map is required")
    private Map<Long, BigDecimal> studentMarks;

    private String remarks;

    /**
     * "MID" = faculty publishes mid-semester result
     * "SEM" = admin publishes semester result
     * If null, defaults to "MID"
     */
    private String resultType;
}

package com.campusiq.assessment.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;

public class ResultRequest {

    @NotNull(message = "Exam ID is required")
    private Long examId;

    @NotNull(message = "Student marks map is required")
    private Map<Long, BigDecimal> studentMarks;

    private String remarks;
    private String resultType;

    public ResultRequest() {}

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }
    public Map<Long, BigDecimal> getStudentMarks() { return studentMarks; }
    public void setStudentMarks(Map<Long, BigDecimal> studentMarks) { this.studentMarks = studentMarks; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getResultType() { return resultType; }
    public void setResultType(String resultType) { this.resultType = resultType; }
}

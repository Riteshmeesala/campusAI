package com.campusiq.assessment.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;

public class CgpaUploadRequest {

    @NotNull(message = "Student CGPA map is required")
    private Map<Long, BigDecimal> studentCgpaMap;

    private Integer semester;
    private String remarks;

    public CgpaUploadRequest() {}

    public Map<Long, BigDecimal> getStudentCgpaMap() { return studentCgpaMap; }
    public void setStudentCgpaMap(Map<Long, BigDecimal> studentCgpaMap) { this.studentCgpaMap = studentCgpaMap; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}

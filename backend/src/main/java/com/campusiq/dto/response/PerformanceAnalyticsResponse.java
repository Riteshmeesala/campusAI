package com.campusiq.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceAnalyticsResponse {

    private Long studentId;
    private String studentName;
    private String enrollmentNumber;
    private BigDecimal overallPercentage;
    private String performanceCategory;
    private BigDecimal attendancePercentage;
    private List<CoursePerformance> coursePerformances;
    private List<String> suggestions;
    private String priorityAction;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoursePerformance {
        private String courseCode;
        private String courseName;
        private BigDecimal percentage;
        private String grade;
        private long attendanceCount;
        private long totalClasses;
        private BigDecimal attendancePercent;
    }
}

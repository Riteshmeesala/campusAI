package com.campusiq.assessment.dto;

import java.math.BigDecimal;
import java.util.List;

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

    public PerformanceAnalyticsResponse() {}

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getEnrollmentNumber() { return enrollmentNumber; }
    public void setEnrollmentNumber(String enrollmentNumber) { this.enrollmentNumber = enrollmentNumber; }
    public BigDecimal getOverallPercentage() { return overallPercentage; }
    public void setOverallPercentage(BigDecimal overallPercentage) { this.overallPercentage = overallPercentage; }
    public String getPerformanceCategory() { return performanceCategory; }
    public void setPerformanceCategory(String performanceCategory) { this.performanceCategory = performanceCategory; }
    public BigDecimal getAttendancePercentage() { return attendancePercentage; }
    public void setAttendancePercentage(BigDecimal attendancePercentage) { this.attendancePercentage = attendancePercentage; }
    public List<CoursePerformance> getCoursePerformances() { return coursePerformances; }
    public void setCoursePerformances(List<CoursePerformance> coursePerformances) { this.coursePerformances = coursePerformances; }
    public List<String> getSuggestions() { return suggestions; }
    public void setSuggestions(List<String> suggestions) { this.suggestions = suggestions; }
    public String getPriorityAction() { return priorityAction; }
    public void setPriorityAction(String priorityAction) { this.priorityAction = priorityAction; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final PerformanceAnalyticsResponse r = new PerformanceAnalyticsResponse();
        public Builder studentId(Long id) { r.setStudentId(id); return this; }
        public Builder studentName(String name) { r.setStudentName(name); return this; }
        public Builder enrollmentNumber(String num) { r.setEnrollmentNumber(num); return this; }
        public Builder overallPercentage(BigDecimal p) { r.setOverallPercentage(p); return this; }
        public Builder performanceCategory(String c) { r.setPerformanceCategory(c); return this; }
        public Builder attendancePercentage(BigDecimal ap) { r.setAttendancePercentage(ap); return this; }
        public Builder coursePerformances(List<CoursePerformance> cp) { r.setCoursePerformances(cp); return this; }
        public Builder suggestions(List<String> s) { r.setSuggestions(s); return this; }
        public Builder priorityAction(String a) { r.setPriorityAction(a); return this; }
        public PerformanceAnalyticsResponse build() { return r; }
    }

    public static class CoursePerformance {
        private String courseCode;
        private String courseName;
        private BigDecimal percentage;
        private String grade;
        private long attendanceCount;
        private long totalClasses;
        private BigDecimal attendancePercent;

        public CoursePerformance() {}

        public String getCourseCode() { return courseCode; }
        public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }
        public BigDecimal getPercentage() { return percentage; }
        public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }
        public String getGrade() { return grade; }
        public void setGrade(String grade) { this.grade = grade; }
        public long getAttendanceCount() { return attendanceCount; }
        public void setAttendanceCount(long attendanceCount) { this.attendanceCount = attendanceCount; }
        public long getTotalClasses() { return totalClasses; }
        public void setTotalClasses(long totalClasses) { this.totalClasses = totalClasses; }
        public BigDecimal getAttendancePercent() { return attendancePercent; }
        public void setAttendancePercent(BigDecimal attendancePercent) { this.attendancePercent = attendancePercent; }

        public static Builder builder() {
            return new Builder();
        }

        public static class Builder {
            private final CoursePerformance cp = new CoursePerformance();
            public Builder courseCode(String c) { cp.setCourseCode(c); return this; }
            public Builder courseName(String n) { cp.setCourseName(n); return this; }
            public Builder percentage(BigDecimal p) { cp.setPercentage(p); return this; }
            public Builder grade(String g) { cp.setGrade(g); return this; }
            public Builder attendanceCount(long ac) { cp.setAttendanceCount(ac); return this; }
            public Builder totalClasses(long tc) { cp.setTotalClasses(tc); return this; }
            public Builder attendancePercent(BigDecimal ap) { cp.setAttendancePercent(ap); return this; }
            public CoursePerformance build() { return cp; }
        }
    }
}

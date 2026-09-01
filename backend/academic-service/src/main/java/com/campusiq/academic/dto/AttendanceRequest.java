package com.campusiq.academic.dto;

import com.campusiq.academic.entity.Attendance.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.Map;

public class AttendanceRequest {

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    @NotNull(message = "Attendance records are required")
    private Map<Long, AttendanceStatus> records;

    private String remarks;

    public AttendanceRequest() {}

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }
    public Map<Long, AttendanceStatus> getRecords() { return records; }
    public void setRecords(Map<Long, AttendanceStatus> records) { this.records = records; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}

package com.campusiq.dto.request;

import com.campusiq.entity.Attendance.AttendanceStatus;
import lombok.Data;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class AttendanceRequest {

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    // Map of studentId -> status
    @NotNull(message = "Attendance records are required")
    private Map<Long, AttendanceStatus> records;

    private String remarks;
}

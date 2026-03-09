package com.campusiq.controller;

import com.campusiq.dto.request.AttendanceRequest;
import com.campusiq.dto.response.ApiResponse;
import com.campusiq.entity.Attendance;
import com.campusiq.security.UserPrincipal;
import com.campusiq.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController @RequestMapping("/attendance") @RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;

    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<List<Attendance>>> mark(
            @Valid @RequestBody AttendanceRequest req,
            @AuthenticationPrincipal UserPrincipal me) {
        var records = attendanceService.markAttendance(req, me.getId());
        return ResponseEntity.ok(ApiResponse.success(records, "Marked " + records.size() + " records"));
    }

    @GetMapping("/my")
    // All authenticated users - student sees own, others get empty
    public ResponseEntity<ApiResponse<List<Attendance>>> myAttendance(@AuthenticationPrincipal UserPrincipal me) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getStudentAttendance(me.getId())));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('STUDENT','FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<List<Attendance>>> studentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getStudentAttendance(studentId)));
    }

    @GetMapping("/student/{studentId}/course/{courseId}/percentage")
    @PreAuthorize("hasAnyRole('STUDENT','FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<BigDecimal>> percentage(
            @PathVariable Long studentId, @PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getPercentage(studentId, courseId)));
    }

    @GetMapping("/course/{courseId}/date/{date}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<List<Attendance>>> courseByDate(
            @PathVariable Long courseId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getCourseAttendanceByDate(courseId, date)));
    }
}

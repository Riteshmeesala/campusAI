package com.campusiq.assessment.controller;

import com.campusiq.assessment.dto.PerformanceAnalyticsResponse;
import com.campusiq.assessment.service.PerformanceAnalyticsService;
import com.campusiq.common.dto.ApiResponse;
import com.campusiq.common.enums.Role;
import com.campusiq.common.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private final PerformanceAnalyticsService analyticsService;

    public AnalyticsController(PerformanceAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/performance/student/{studentId}")
    public ResponseEntity<ApiResponse<PerformanceAnalyticsResponse>> getStudentPerformance(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.analyzeStudentPerformance(studentId)));
    }

    @GetMapping("/performance/my")
    public ResponseEntity<ApiResponse<PerformanceAnalyticsResponse>> getMyPerformance(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }

        if (currentUser.getRole() != Role.STUDENT) {
            return ResponseEntity.ok(ApiResponse.success(
                    PerformanceAnalyticsResponse.builder()
                            .studentId(currentUser.getId())
                            .studentName(currentUser.getName())
                            .overallPercentage(BigDecimal.ZERO)
                            .attendancePercentage(BigDecimal.ZERO)
                            .performanceCategory("N/A")
                            .coursePerformances(List.of())
                            .suggestions(List.of("AI Insights available for student accounts only."))
                            .priorityAction("Select a student to view their analytics.")
                            .build()));
        }
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.analyzeStudentPerformance(currentUser.getId())));
    }
}

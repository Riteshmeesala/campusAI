package com.campusiq.controller;

import com.campusiq.dto.response.ApiResponse;
import com.campusiq.dto.response.PerformanceAnalyticsResponse;
import com.campusiq.entity.Role;
import com.campusiq.security.UserPrincipal;
import com.campusiq.service.PerformanceAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final PerformanceAnalyticsService analyticsService;

    @GetMapping("/performance/student/{studentId}")
    public ResponseEntity<ApiResponse<PerformanceAnalyticsResponse>> getStudentPerformance(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.analyzeStudentPerformance(studentId)));
    }

    // NO @PreAuthorize — works for ALL roles
    @GetMapping("/performance/my")
    public ResponseEntity<ApiResponse<PerformanceAnalyticsResponse>> getMyPerformance(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (currentUser.getRole() != Role.STUDENT) {
            // Faculty/Admin: return empty response, no crash, no 403
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
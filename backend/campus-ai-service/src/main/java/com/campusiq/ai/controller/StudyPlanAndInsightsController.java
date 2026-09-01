package com.campusiq.ai.controller;

import com.campusiq.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/ai")
public class StudyPlanAndInsightsController {

    @GetMapping("/study-plan")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdaptiveStudyPlan() {
        Map<String, Object> plan = Map.of(
                "studentName", "Ritesh Meesala",
                "targetCgpa", 9.5,
                "weeklyFocus", "Compiler Design Theory & Advanced Distributed Systems",
                "recommendedHoursPerDay", 3.5,
                "schedule", List.of(
                        Map.of("day", "Monday", "topic", "Lexical Analysis & DFA State Minimization", "hours", 2.0, "status", "Completed"),
                        Map.of("day", "Tuesday", "topic", "Distributed Raft Consensus & Byzantine Fault Tolerance", "hours", 2.0, "status", "Pending"),
                        Map.of("day", "Wednesday", "topic", "Machine Learning Gradient Descent Optimization", "hours", 1.5, "status", "Pending"),
                        Map.of("day", "Thursday", "topic", "LLVM Intermediate Representation & Optimization Passes", "hours", 2.5, "status", "Pending")
                )
        );
        return ResponseEntity.ok(ApiResponse.success(plan));
    }

    @GetMapping("/performance-insights")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPerformanceInsights() {
        Map<String, Object> insights = Map.of(
                "currentSgpaTrend", List.of(8.8, 9.1, 9.3, 9.4, 9.42),
                "predictedNextSgpa", 9.55,
                "examBacklogRisk", "0.0% (Zero Risk)",
                "attendanceCondonationRisk", "Low Risk (Aggregate 88.5%)",
                "topStrength", "Algorithms & Machine Learning (Grade: O / 10.0)",
                "recommendedFocusArea", "Compiler Design (Improve Mid-term score by +4 marks)"
        );
        return ResponseEntity.ok(ApiResponse.success(insights));
    }
}

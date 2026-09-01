package com.campusiq.academic.controller;

import com.campusiq.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/projects")
public class AcademicProjectsController {

    private final List<Map<String, Object>> projects = new CopyOnWriteArrayList<>();

    public AcademicProjectsController() {
        initSampleData();
    }

    private void initSampleData() {
        Map<String, Object> p1 = new HashMap<>();
        p1.put("id", "PRJ-2026-CSE-019");
        p1.put("title", "Autonomous Edge-AI Traffic Congestion Optimization System");
        p1.put("domain", "Artificial Intelligence & Edge Computing");
        p1.put("guideName", "Dr. S. K. Sharma (Professor, CSE)");
        p1.put("status", "Phase-2 In Progress");
        p1.put("phase1Score", "23.5 / 25");
        p1.put("phase2Score", "24.0 / 25");
        p1.put("members", List.of(
                Map.of("name", "Ritesh Meesala", "roll", "23CS042", "role", "Team Lead & ML Architect"),
                Map.of("name", "Priya Sharma", "roll", "23CS045", "role", "Embedded Edge Hardware"),
                Map.of("name", "Rohan Varma", "roll", "23CS048", "role", "Backend API Developer")
        ));
        projects.add(p1);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getProjects() {
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @PostMapping("/submit-milestone")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitMilestone(@RequestBody Map<String, Object> req) {
        Map<String, Object> res = Map.of(
                "projectId", req.getOrDefault("projectId", "PRJ-2026-CSE-019"),
                "submittedOn", LocalDate.now().toString(),
                "milestone", req.getOrDefault("milestone", "Phase-2 Interim Synopsis"),
                "status", "Submitted & Awaiting Guide Evaluation"
        );
        return ResponseEntity.ok(ApiResponse.success(res, "Project milestone report submitted"));
    }
}

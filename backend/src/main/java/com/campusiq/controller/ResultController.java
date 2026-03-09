package com.campusiq.controller;

import com.campusiq.dto.request.ResultRequest;
import com.campusiq.dto.response.ApiResponse;
import com.campusiq.entity.Result;
import com.campusiq.security.UserPrincipal;
import com.campusiq.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    // ── PUBLISH ENDPOINTS ────────────────────────────────────────────────────

    /**
     * FACULTY ONLY: Publish mid-semester results
     * POST /results/publish/mid
     */
    @PostMapping("/publish/mid")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<List<Result>>> publishMid(
            @RequestBody ResultRequest req,
            @AuthenticationPrincipal UserPrincipal me) {
        return ResponseEntity.ok(ApiResponse.success(
            resultService.publishResults(req, "MID", me.getUser().getId()),
            "Mid-semester results published successfully"));
    }

    /**
     * ADMIN ONLY: Publish semester (end-term) results
     * POST /results/publish/sem
     */
    @PostMapping("/publish/sem")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Result>>> publishSem(
            @RequestBody ResultRequest req,
            @AuthenticationPrincipal UserPrincipal me) {
        return ResponseEntity.ok(ApiResponse.success(
            resultService.publishResults(req, "SEM", me.getUser().getId()),
            "Semester results published successfully"));
    }

    /**
     * Legacy endpoint — defaults to MID type, Faculty+Admin allowed
     * POST /results/publish
     */
    @PostMapping("/publish")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<List<Result>>> publish(
            @RequestBody ResultRequest req,
            @AuthenticationPrincipal UserPrincipal me) {
        return ResponseEntity.ok(ApiResponse.success(
            resultService.publishResults(req, "MID", me.getUser().getId())));
    }

    // ── STUDENT VIEW ENDPOINTS ────────────────────────────────────────────────

    /** All results for logged-in student */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Result>>> myResults(
            @AuthenticationPrincipal UserPrincipal me) {
        return ResponseEntity.ok(ApiResponse.success(
            resultService.getStudentResults(me.getUser().getId())));
    }

    /** Mid-semester results for logged-in student */
    @GetMapping("/my/mid")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<Result>>> myMidResults(
            @AuthenticationPrincipal UserPrincipal me) {
        return ResponseEntity.ok(ApiResponse.success(
            resultService.getStudentResultsByType(me.getUser().getId(), "MID")));
    }

    /** Semester results for logged-in student */
    @GetMapping("/my/sem")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<Result>>> mySemResults(
            @AuthenticationPrincipal UserPrincipal me) {
        return ResponseEntity.ok(ApiResponse.success(
            resultService.getStudentResultsByType(me.getUser().getId(), "SEM")));
    }

    /** GPA for logged-in student */
    @GetMapping("/my/gpa")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> myGpa(
            @AuthenticationPrincipal UserPrincipal me) {
        return ResponseEntity.ok(ApiResponse.success(
            resultService.getStudentGPA(me.getUser().getId())));
    }

    // ── FACULTY / ADMIN ENDPOINTS ─────────────────────────────────────────────

    /** Get all results for a specific student */
    @GetMapping("/student/{id}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN','STUDENT')")
    public ResponseEntity<ApiResponse<List<Result>>> studentResults(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(resultService.getStudentResults(id)));
    }

    /** GPA for a specific student */
    @GetMapping("/student/{id}/gpa")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> studentGpa(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(resultService.getStudentGPA(id)));
    }

    /** Semester GPA for a specific student */
    @GetMapping("/student/{id}/semester/{sem}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN','STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> semesterGpa(
            @PathVariable Long id, @PathVariable Integer sem) {
        return ResponseEntity.ok(ApiResponse.success(resultService.getSemesterGPA(id, sem)));
    }

    /** All results for a specific exam */
    @GetMapping("/exam/{id}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<List<Result>>> examResults(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(resultService.getExamResults(id)));
    }

    /** Student results for a specific course */
    @GetMapping("/student/{sid}/course/{cid}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN','STUDENT')")
    public ResponseEntity<ApiResponse<List<Result>>> studentCourseResults(
            @PathVariable Long sid, @PathVariable Long cid) {
        return ResponseEntity.ok(ApiResponse.success(resultService.getStudentCourseResults(sid, cid)));
    }

    /** All students list with their results for admin/faculty */
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<List<Result>>> allResults() {
        return ResponseEntity.ok(ApiResponse.success(resultService.getAllResults()));
    }
}
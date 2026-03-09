package com.campusiq.controller;

import com.campusiq.dto.request.CgpaUploadRequest;
import com.campusiq.dto.response.ApiResponse;
import com.campusiq.entity.StudentCgpa;
import com.campusiq.security.UserPrincipal;
import com.campusiq.service.CgpaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * CGPA / SGPA publish endpoints.
 *
 * POST  /cgpa/publish          → ADMIN ONLY — bulk upload CGPA values
 * GET   /cgpa/student/{id}     → ADMIN or STUDENT self — view CGPA history
 * GET   /cgpa/all              → ADMIN ONLY — view all students' CGPA records
 */
@RestController
@RequestMapping("/cgpa")
@RequiredArgsConstructor
public class CgpaController {

    private final CgpaService cgpaService;

    /**
     * ADMIN ONLY: Publish (bulk upload) CGPA values for students.
     * POST /cgpa/publish
     */
    @PostMapping("/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentCgpa>>> publishCgpa(
            @RequestBody CgpaUploadRequest req,
            @AuthenticationPrincipal UserPrincipal me) {

        List<StudentCgpa> result = cgpaService.publishCgpa(req, me.getUser().getId());
        return ResponseEntity.ok(ApiResponse.success(
            result,
            result.size() + " student CGPA record(s) published successfully"));
    }

    /**
     * ADMIN or the STUDENT themselves: view CGPA history.
     * GET /cgpa/student/{id}
     */
    @GetMapping("/student/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT','FACULTY')")
    public ResponseEntity<ApiResponse<List<StudentCgpa>>> getStudentCgpa(
            @PathVariable Long id) {

        return ResponseEntity.ok(ApiResponse.success(cgpaService.getStudentCgpa(id)));
    }

    /**
     * ADMIN ONLY: view all CGPA records across all students.
     * GET /cgpa/all
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentCgpa>>> getAllCgpa() {
        return ResponseEntity.ok(ApiResponse.success(cgpaService.getAllCgpa()));
    }
}
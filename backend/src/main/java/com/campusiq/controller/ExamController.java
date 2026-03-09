package com.campusiq.controller;

import com.campusiq.dto.request.ExamRequest;
import com.campusiq.dto.response.ApiResponse;
import com.campusiq.entity.Exam;
import com.campusiq.service.ExamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/exams") @RequiredArgsConstructor
public class ExamController {
    private final ExamService examService;

    @PostMapping
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<Exam>> create(@Valid @RequestBody ExamRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(examService.createExam(req), "Exam created"));
    }

    @GetMapping           public ResponseEntity<ApiResponse<List<Exam>>> getAll()      { return ResponseEntity.ok(ApiResponse.success(examService.getAllExams())); }
    @GetMapping("/upcoming") public ResponseEntity<ApiResponse<List<Exam>>> upcoming() { return ResponseEntity.ok(ApiResponse.success(examService.getUpcoming())); }
    @GetMapping("/{id}")  public ResponseEntity<ApiResponse<Exam>> getById(@PathVariable Long id) { return ResponseEntity.ok(ApiResponse.success(examService.getById(id))); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<Exam>> update(@PathVariable Long id, @Valid @RequestBody ExamRequest req) {
        return ResponseEntity.ok(ApiResponse.success(examService.updateExam(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Deleted"));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<Exam>>> byCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(examService.getByCourse(courseId)));
    }
}

package com.campusiq.academic.controller;

import com.campusiq.academic.entity.FacultySubjectAssignment;
import com.campusiq.academic.entity.User;
import com.campusiq.academic.repository.FacultySubjectAssignmentRepository;
import com.campusiq.academic.repository.UserRepository;
import com.campusiq.common.dto.ApiResponse;
import com.campusiq.common.exception.ResourceNotFoundException;
import com.campusiq.common.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/faculty-assignments")
public class FacultySubjectAssignmentController {

    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    public FacultySubjectAssignmentController(FacultySubjectAssignmentRepository assignmentRepository,
                                             UserRepository userRepository) {
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<List<FacultySubjectAssignment>>> getAllAssignments() {
        return ResponseEntity.ok(ApiResponse.success(assignmentRepository.findAll()));
    }

    @GetMapping("/faculty/{facultyId}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<List<FacultySubjectAssignment>>> getByFaculty(@PathVariable Long facultyId) {
        return ResponseEntity.ok(ApiResponse.success(assignmentRepository.findByFacultyId(facultyId)));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<List<FacultySubjectAssignment>>> getMyAssignments(@AuthenticationPrincipal UserPrincipal me) {
        if (me == null || me.getId() == null) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        return ResponseEntity.ok(ApiResponse.success(assignmentRepository.findByFacultyId(me.getId())));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FacultySubjectAssignment>> createAssignment(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal me) {

        Long facultyId = Long.valueOf(body.get("facultyId").toString());
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty User", "id", facultyId));

        String department = body.getOrDefault("department", faculty.getDepartment() != null ? faculty.getDepartment() : "Computer Science").toString();
        String subjectCode = body.getOrDefault("subjectCode", "").toString().trim();
        String subjectName = body.getOrDefault("subjectName", "").toString().trim();
        String semesterCode = body.getOrDefault("semesterCode", "1-1").toString().trim();
        String academicYear = body.getOrDefault("academicYear", "2025-2026").toString().trim();
        String section = body.getOrDefault("section", "Section A").toString().trim();
        Integer creditHours = body.get("creditHours") != null ? Integer.valueOf(body.get("creditHours").toString()) : 3;

        if (subjectCode.isEmpty() || subjectName.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Subject code and subject name are required"));
        }

        FacultySubjectAssignment assignment = FacultySubjectAssignment.builder()
                .faculty(faculty)
                .department(department)
                .subjectCode(subjectCode)
                .subjectName(subjectName)
                .semesterCode(semesterCode)
                .academicYear(academicYear)
                .section(section)
                .creditHours(creditHours)
                .active(true)
                .assignedBy(me != null ? me.getId() : 1L)
                .build();

        FacultySubjectAssignment saved = assignmentRepository.save(assignment);
        return ResponseEntity.status(201).body(ApiResponse.success(saved, "Subject successfully assigned to faculty"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FacultySubjectAssignment>> updateAssignment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal me) {

        FacultySubjectAssignment existing = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty Subject Assignment", "id", id));

        if (body.containsKey("facultyId") && body.get("facultyId") != null) {
            Long facultyId = Long.valueOf(body.get("facultyId").toString());
            User faculty = userRepository.findById(facultyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty User", "id", facultyId));
            existing.setFaculty(faculty);
        }
        if (body.containsKey("department")) existing.setDepartment(body.get("department").toString());
        if (body.containsKey("subjectCode")) existing.setSubjectCode(body.get("subjectCode").toString());
        if (body.containsKey("subjectName")) existing.setSubjectName(body.get("subjectName").toString());
        if (body.containsKey("semesterCode")) existing.setSemesterCode(body.get("semesterCode").toString());
        if (body.containsKey("academicYear")) existing.setAcademicYear(body.get("academicYear").toString());
        if (body.containsKey("section")) existing.setSection(body.get("section").toString());
        if (body.containsKey("creditHours")) existing.setCreditHours(Integer.valueOf(body.get("creditHours").toString()));
        if (body.containsKey("active")) existing.setActive(Boolean.valueOf(body.get("active").toString()));

        if (me != null && me.getId() != null) existing.setAssignedBy(me.getId());

        FacultySubjectAssignment updated = assignmentRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success(updated, "Subject assignment updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable Long id) {
        FacultySubjectAssignment existing = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty Subject Assignment", "id", id));
        assignmentRepository.delete(existing);
        return ResponseEntity.ok(ApiResponse.success(null, "Subject assignment removed"));
    }
}

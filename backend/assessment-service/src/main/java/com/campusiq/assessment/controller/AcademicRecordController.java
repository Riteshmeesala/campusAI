package com.campusiq.assessment.controller;

import com.campusiq.assessment.entity.StudentAcademicRecord;
import com.campusiq.assessment.service.AcademicRecordService;
import com.campusiq.common.dto.ApiResponse;
import com.campusiq.common.enums.Role;
import com.campusiq.common.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/academic-records")
public class AcademicRecordController {

    private final AcademicRecordService academicRecordService;

    public AcademicRecordController(AcademicRecordService academicRecordService) {
        this.academicRecordService = academicRecordService;
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY','STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentRecords(
            @PathVariable Long studentId,
            @AuthenticationPrincipal UserPrincipal me) {
        if (me != null && me.getRole() == Role.STUDENT && !me.getId().equals(studentId)) {
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                academicRecordService.getFullAcademicProfile(studentId)
        ));
    }

    @GetMapping("/student/{studentId}/semester/{semCode}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY','STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentSemester(
            @PathVariable Long studentId,
            @PathVariable String semCode,
            @AuthenticationPrincipal UserPrincipal me) {
        if (me != null && me.getRole() == Role.STUDENT && !me.getId().equals(studentId)) {
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                academicRecordService.getSemesterDetails(studentId, semCode)
        ));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyRecords(
            @AuthenticationPrincipal UserPrincipal me) {
        if (me == null || me.getId() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                academicRecordService.getFullAcademicProfile(me.getId())
        ));
    }

    @GetMapping("/my/semester/{semCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMySemester(
            @PathVariable String semCode,
            @AuthenticationPrincipal UserPrincipal me) {
        if (me == null || me.getId() == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                academicRecordService.getSemesterDetails(me.getId(), semCode)
        ));
    }

    @PostMapping("/student/{studentId}/marks")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<StudentAcademicRecord>> updateSubjectMarks(
            @PathVariable Long studentId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal me) {
        Long adminId = me != null ? me.getId() : 1L;
        StudentAcademicRecord updated = academicRecordService.updateSingleSubjectMarks(studentId, body, adminId);
        return ResponseEntity.ok(ApiResponse.success(updated, "Marks and GPA updated successfully"));
    }

    @PostMapping("/student/{studentId}/batch-update")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> batchUpdateSemester(
            @PathVariable Long studentId,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal me) {
        Long adminId = me != null ? me.getId() : 1L;
        Map<String, Object> res = academicRecordService.batchUpdateSemester(studentId, body, adminId);
        return ResponseEntity.ok(ApiResponse.success(res, "Semester records and summary saved to database"));
    }

    @PostMapping("/import/csv")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> importAcademicCsv(
            @RequestBody java.util.List<Map<String, Object>> rows,
            @AuthenticationPrincipal UserPrincipal me) {
        Long userId = me != null ? me.getId() : 1L;
        String role = me != null && me.getRole() != null ? me.getRole().name() : "FACULTY";
        Map<String, Object> res = academicRecordService.importAcademicRecordsFromCsv(rows, userId, role);
        return ResponseEntity.ok(ApiResponse.success(res, "Academic CSV marks imported successfully"));
    }
}

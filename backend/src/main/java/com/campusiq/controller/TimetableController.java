package com.campusiq.controller;

import com.campusiq.dto.response.ApiResponse;
import com.campusiq.entity.TimetableSlot;
import com.campusiq.security.UserPrincipal;
import com.campusiq.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    /** GET /timetable/my — Faculty sees own weekly timetable */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN','STUDENT')")
    public ResponseEntity<ApiResponse<List<TimetableSlot>>> getMyTimetable(
            @AuthenticationPrincipal UserPrincipal me) {
        return ResponseEntity.ok(ApiResponse.success(timetableService.getFacultyTimetable(me.getId())));
    }

    /** GET /timetable/faculty/{facultyId} */
    @GetMapping("/faculty/{facultyId}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN','STUDENT')")
    public ResponseEntity<ApiResponse<List<TimetableSlot>>> getFacultyTimetable(
            @PathVariable Long facultyId) {
        return ResponseEntity.ok(ApiResponse.success(timetableService.getFacultyTimetable(facultyId)));
    }

    /** GET /timetable/course/{courseId} */
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN','STUDENT')")
    public ResponseEntity<ApiResponse<List<TimetableSlot>>> getCourseTimetable(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(timetableService.getCourseTimetable(courseId)));
    }

    /** POST /timetable — Add new timetable slot */
    @PostMapping
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<TimetableSlot>> addSlot(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestBody Map<String, Object> req) {
        Long facultyId = me.getRole().name().equals("ADMIN") && req.containsKey("facultyId")
                ? Long.valueOf(req.get("facultyId").toString())
                : me.getId();
        TimetableSlot slot = timetableService.addSlot(facultyId, req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(slot, "Timetable slot added successfully"));
    }

    /** PUT /timetable/{id} — Update slot */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<TimetableSlot>> updateSlot(
            @PathVariable Long id,
            @RequestBody Map<String, Object> req) {
        TimetableSlot slot = timetableService.updateSlot(id, req);
        return ResponseEntity.ok(ApiResponse.success(slot, "Timetable slot updated"));
    }

    /** DELETE /timetable/{id} — Delete slot */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(@PathVariable Long id) {
        timetableService.deleteSlot(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Timetable slot deleted"));
    }
}

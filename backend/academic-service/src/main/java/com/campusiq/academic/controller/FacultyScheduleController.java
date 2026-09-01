package com.campusiq.academic.controller;

import com.campusiq.academic.entity.FacultySchedule;
import com.campusiq.academic.service.FacultyScheduleService;
import com.campusiq.common.dto.ApiResponse;
import com.campusiq.common.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/faculty-schedules", "/schedule"})
public class FacultyScheduleController {

    private final FacultyScheduleService scheduleService;

    public FacultyScheduleController(FacultyScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<List<FacultySchedule>>> getMySchedules(
            @AuthenticationPrincipal UserPrincipal me) {
        if (me == null || me.getId() == null) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getFacultySchedules(me.getId())));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<FacultySchedule>>> getCourseSchedules(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getCourseSchedules(courseId)));
    }

    @GetMapping("/faculty/{facultyId}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<List<FacultySchedule>>> getFacultySchedules(
            @PathVariable Long facultyId) {
        return ResponseEntity.ok(ApiResponse.success(scheduleService.getFacultySchedules(facultyId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<FacultySchedule>> addSchedule(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestBody Map<String, Object> req) {
        Long facultyId = me != null && me.getRole().name().equals("ADMIN") && req.containsKey("facultyId")
                ? Long.valueOf(req.get("facultyId").toString())
                : (me != null ? me.getId() : 1L);
        Long courseId = Long.valueOf(req.get("courseId").toString());

        Object dateObj = req.get("scheduleDate") != null ? req.get("scheduleDate") : req.get("date");
        LocalDate date = dateObj != null ? LocalDate.parse(dateObj.toString()) : LocalDate.now();

        String topic = req.getOrDefault("topicCovered", "Class Session").toString();
        String subTopics = req.getOrDefault("subTopics", "").toString();
        String chapter = req.getOrDefault("chapterNumber", "").toString();
        Double hours = req.get("durationHours") != null ? Double.valueOf(req.get("durationHours").toString()) : 1.0;
        String method = req.getOrDefault("teachingMethod", "Lecture").toString();
        String period = req.getOrDefault("classPeriod", "1st Period").toString();
        String remarks = req.getOrDefault("remarks", "").toString();

        FacultySchedule saved = scheduleService.addSchedule(facultyId, courseId, date, topic, subTopics, chapter, hours, method, period, remarks);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved, "Schedule log added"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Schedule deleted"));
    }
}

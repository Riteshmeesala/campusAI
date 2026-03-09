package com.campusiq.controller;

import com.campusiq.dto.response.ApiResponse;
import com.campusiq.entity.FacultySchedule;
import com.campusiq.security.UserPrincipal;
import com.campusiq.service.FacultyScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/schedule") @RequiredArgsConstructor
public class FacultyScheduleController {
    private final FacultyScheduleService scheduleService;

    @PostMapping
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<FacultySchedule>> addSchedule(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestBody Map<String, Object> body) {
        Long facultyId = me.getUser().getRole().name().equals("ADMIN")
            ? Long.valueOf(body.get("facultyId").toString())
            : me.getUser().getId();
        Long courseId     = Long.valueOf(body.get("courseId").toString());
        LocalDate date    = LocalDate.parse(body.get("date").toString());
        String topic      = body.get("topicCovered").toString();
        String subTopics  = body.getOrDefault("subTopics","").toString();
        String chapter    = body.getOrDefault("chapterNumber","").toString();
        Double hours      = body.get("durationHours") != null
            ? Double.valueOf(body.get("durationHours").toString()) : 1.0;
        String method     = body.getOrDefault("teachingMethod","Lecture").toString();
        String period     = body.getOrDefault("classPeriod","1st").toString();
        String remarks    = body.getOrDefault("remarks","").toString();

        FacultySchedule fs = scheduleService.addSchedule(facultyId, courseId, date, topic,
            subTopics, chapter, hours, method, period, remarks);
        return ResponseEntity.ok(ApiResponse.success(fs));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<List<FacultySchedule>>> mySchedules(
            @AuthenticationPrincipal UserPrincipal me) {
        return ResponseEntity.ok(ApiResponse.success(
            scheduleService.getFacultySchedules(me.getUser().getId())));
    }

    @GetMapping("/faculty/{facultyId}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN','STUDENT')")
    public ResponseEntity<ApiResponse<List<FacultySchedule>>> facultySchedules(
            @PathVariable Long facultyId) {
        return ResponseEntity.ok(ApiResponse.success(
            scheduleService.getFacultySchedules(facultyId)));
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN','STUDENT')")
    public ResponseEntity<ApiResponse<List<FacultySchedule>>> courseSchedules(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(ApiResponse.success(
            scheduleService.getCourseSchedules(courseId)));
    }

    @GetMapping("/my/date/{date}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<List<FacultySchedule>>> myDateSchedules(
            @AuthenticationPrincipal UserPrincipal me,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(
            scheduleService.getFacultyDateSchedules(me.getUser().getId(), date)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.success("Schedule deleted"));
    }
}

package com.campusiq.controller;

import com.campusiq.dto.request.AnnouncementRequest;
import com.campusiq.dto.response.ApiResponse;
import com.campusiq.service.AnnouncementService;
import com.campusiq.service.AnnouncementService.AnnouncementResult;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * FIXES the 404 errors:
 *   POST /api/announcements/send
 *   POST /api/announcements/send/holiday
 *   POST /api/announcements/send/exam
 *   POST /api/announcements/send/event
 */
@RestController
@RequestMapping("/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    /**
     * Full custom announcement — admin sends to ALL students.
     * Body: { subject, body, type, sendEmail, saveNotification }
     */
    @PostMapping("/send")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> send(
            @Valid @RequestBody AnnouncementRequest req) {

        AnnouncementResult r = announcementService.send(req);
        return ResponseEntity.ok(ApiResponse.success(
            Map.of(
                "totalStudents",      r.totalStudents(),
                "emailsSent",         r.emailsSent(),
                "notificationsSaved", r.notificationsSaved(),
                "failures",           r.failures(),
                "message",            String.format(
                    "Sent to %d students (%d emails, %d notifications)",
                    r.totalStudents(), r.emailsSent(), r.notificationsSaved())
            ),
            "Announcement sent successfully"
        ));
    }

    /** Quick: Holiday announcement to ALL students */
    @PostMapping("/send/holiday")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendHoliday(
            @RequestBody Map<String, String> body) {

        AnnouncementRequest req = new AnnouncementRequest();
        req.setSubject(body.getOrDefault("subject", "Holiday Announcement"));
        req.setBody(body.getOrDefault("body",
            "Dear Students,\n\nThe college will remain closed tomorrow.\n\nRegards,\nCampusIQ+ Administration"));
        req.setType("HOLIDAY");
        req.setSendEmail(true);
        req.setSaveNotification(true);

        AnnouncementResult r = announcementService.send(req);
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("sent", r.totalStudents(), "emails", r.emailsSent()),
            "Holiday notice sent to all students!"));
    }

    /** Quick: Exam reminder to ALL students */
    @PostMapping("/send/exam")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendExam(
            @RequestBody Map<String, String> body) {

        AnnouncementRequest req = new AnnouncementRequest();
        req.setSubject(body.getOrDefault("subject", "Upcoming Exam Reminder"));
        req.setBody(body.getOrDefault("body",
            "Dear Students,\n\nThis is a reminder about upcoming exams. Please check the Exams page for schedule and venue.\n\nBest of luck!\nCampusIQ+ Team"));
        req.setType("EXAM");
        req.setSendEmail(true);
        req.setSaveNotification(true);

        AnnouncementResult r = announcementService.send(req);
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("sent", r.totalStudents(), "emails", r.emailsSent()),
            "Exam reminder sent!"));
    }

    /** Quick: Event announcement to ALL students */
    @PostMapping("/send/event")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendEvent(
            @RequestBody Map<String, String> body) {

        AnnouncementRequest req = new AnnouncementRequest();
        req.setSubject(body.getOrDefault("subject", "College Event Announcement"));
        req.setBody(body.getOrDefault("body",
            "Dear Students,\n\nWe are pleased to announce an upcoming college event. Please check the portal for details.\n\nRegards,\nCampusIQ+ Administration"));
        req.setType("EVENT");
        req.setSendEmail(true);
        req.setSaveNotification(true);

        AnnouncementResult r = announcementService.send(req);
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("sent", r.totalStudents(), "emails", r.emailsSent()),
            "Event announcement sent!"));
    }
}

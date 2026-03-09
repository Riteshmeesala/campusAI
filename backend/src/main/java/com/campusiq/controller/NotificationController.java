package com.campusiq.controller;

import com.campusiq.dto.request.BroadcastEmailRequest;
import com.campusiq.dto.response.ApiResponse;
import com.campusiq.entity.Notification;
import com.campusiq.security.UserPrincipal;
import com.campusiq.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getAll(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getAll(me.getId(), page, size)));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> unread(@AuthenticationPrincipal UserPrincipal me) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnread(me.getId())));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Long>> count(@AuthenticationPrincipal UserPrincipal me) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount(me.getId())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Marked as read"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal UserPrincipal me) {
        notificationService.markAllRead(me.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "All marked as read"));
    }

    /**
     * ✅ NEW: Admin sends broadcast email + in-app notification to all students in ONE click.
     * Use for: holidays, events, circulars, general announcements.
     *
     * POST /api/notifications/broadcast
     * Body: { "subject": "...", "message": "...", "targetRole": "ALL"|"STUDENTS"|"FACULTY" }
     *
     * Returns how many users were notified.
     */
    @PostMapping("/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> broadcast(
            @Valid @RequestBody BroadcastEmailRequest req) {

        Notification.NotificationType type = Notification.NotificationType.GENERAL;
        String lower = req.getSubject().toLowerCase();
        if (lower.contains("holiday") || lower.contains("leave")) {
            type = Notification.NotificationType.HOLIDAY;
        } else if (lower.contains("event") || lower.contains("fest") || lower.contains("seminar")) {
            type = Notification.NotificationType.EVENT;
        }

        int count = notificationService.broadcastToStudents(
            req.getSubject(), req.getMessage(), req.getTargetRole(), type);

        return ResponseEntity.ok(ApiResponse.success(
            Map.of("notified", count, "subject", req.getSubject()),
            "Broadcast sent to " + count + " users"));
    }
}

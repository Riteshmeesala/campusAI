package com.campusiq.academic.controller;

import com.campusiq.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/mentoring")
public class MentoringCounselingController {

    private final List<Map<String, Object>> sessions = new CopyOnWriteArrayList<>();

    public MentoringCounselingController() {
        initSampleData();
    }

    private void initSampleData() {
        Map<String, Object> s1 = new HashMap<>();
        s1.put("id", "CSL-2026-01");
        s1.put("studentName", "Ritesh Meesala");
        s1.put("rollNo", "23CS042");
        s1.put("mentorName", "Prof. Ananya Sen");
        s1.put("date", "18 Aug 2026");
        s1.put("type", "Semester Progress Review");
        s1.put("mentorRemarks", "Exceptional academic consistency in ML and Systems. Advised focusing on Compiler Design theory questions.");
        s1.put("outcome", "Satisfactory");
        s1.put("rating", 5);
        s1.put("status", "Completed");
        sessions.add(s1);

        Map<String, Object> s2 = new HashMap<>();
        s2.put("id", "CSL-2026-02");
        s2.put("studentName", "Ritesh Meesala");
        s2.put("rollNo", "23CS042");
        s2.put("mentorName", "Prof. Ananya Sen");
        s2.put("date", "10 Jun 2026");
        s2.put("type", "Career & Internship Guidance");
        s2.put("mentorRemarks", "Discussed research paper submission for IEEE Student Conference and applied for Google Summer Internship.");
        s2.put("outcome", "Action Plan Initiated");
        s2.put("rating", 5);
        s2.put("status", "Completed");
        sessions.add(s2);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSessions() {
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @PostMapping("/book")
    public ResponseEntity<ApiResponse<Map<String, Object>>> bookSession(@RequestBody Map<String, Object> req) {
        Map<String, Object> s = new HashMap<>(req);
        String id = "CSL-2026-" + (100 + new Random().nextInt(900));
        s.put("id", id);
        s.put("status", "Pending Review");
        s.put("date", req.getOrDefault("preferredDate", LocalDate.now().toString()));
        s.put("mentorRemarks", "1-on-1 slot booked by mentee. Awaiting counselor discussion.");
        s.put("outcome", "Scheduled");
        sessions.add(0, s);
        return ResponseEntity.ok(ApiResponse.success(s, "1-on-1 counseling slot requested"));
    }

    @PutMapping("/{id}/remarks")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> addRemarks(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        for (Map<String, Object> s : sessions) {
            if (Objects.equals(s.get("id"), id)) {
                s.put("mentorRemarks", body.getOrDefault("mentorRemarks", "Session completed."));
                s.put("outcome", body.getOrDefault("outcome", "Satisfactory"));
                s.put("status", "Completed");
                return ResponseEntity.ok(ApiResponse.success(s, "Mentor remarks saved successfully"));
            }
        }
        return ResponseEntity.status(404).body(ApiResponse.error("Mentoring session not found"));
    }
}

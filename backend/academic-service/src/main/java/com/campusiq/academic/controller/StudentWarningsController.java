package com.campusiq.academic.controller;

import com.campusiq.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/warnings")
public class StudentWarningsController {

    private final List<Map<String, Object>> warnings = new CopyOnWriteArrayList<>();

    public StudentWarningsController() {
        initSampleData();
    }

    private void initSampleData() {
        Map<String, Object> w1 = new HashMap<>();
        w1.put("id", "WRN-2026-02");
        w1.put("studentName", "Ritesh Meesala");
        w1.put("rollNo", "23CS042");
        w1.put("type", "Academic Attendance Warning");
        w1.put("date", "25 Aug 2026");
        w1.put("issuedBy", "Prof. S. Mukherjee (Compiler Design)");
        w1.put("text", "Your attendance in Compiler Design (CS604PC) has dropped to 72.2%. You are required to meet your counselor and attend all upcoming classes to avoid exam debarment.");
        w1.put("severity", "Medium");
        w1.put("acknowledged", true);
        warnings.add(w1);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllWarnings() {
        return ResponseEntity.ok(ApiResponse.success(warnings));
    }

    @PostMapping("/issue")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> issueWarning(@RequestBody Map<String, Object> req) {
        Map<String, Object> w = new HashMap<>(req);
        w.put("id", "WRN-2026-" + (10 + new Random().nextInt(90)));
        w.put("date", LocalDate.now().toString());
        w.put("acknowledged", false);
        warnings.add(0, w);
        return ResponseEntity.ok(ApiResponse.success(w, "Disciplinary/Academic warning issued successfully"));
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<ApiResponse<Map<String, Object>>> acknowledgeWarning(@PathVariable String id) {
        for (Map<String, Object> w : warnings) {
            if (Objects.equals(w.get("id"), id)) {
                w.put("acknowledged", true);
                return ResponseEntity.ok(ApiResponse.success(w, "Warning acknowledged by student"));
            }
        }
        return ResponseEntity.status(404).body(ApiResponse.error("Warning record not found"));
    }
}

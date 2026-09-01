package com.campusiq.academic.controller;

import com.campusiq.common.dto.ApiResponse;
import com.campusiq.common.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/leaves")
public class StudentLeavesController {

    private final List<Map<String, Object>> leaves = new CopyOnWriteArrayList<>();

    public StudentLeavesController() {
        initSampleData();
    }

    private void initSampleData() {
        Map<String, Object> l1 = new HashMap<>();
        l1.put("id", "LV-2026-092");
        l1.put("studentName", "Ritesh Meesala");
        l1.put("rollNo", "23CS042");
        l1.put("type", "On-Duty (OD)");
        l1.put("fromDate", "2026-09-04");
        l1.put("toDate", "2026-09-04");
        l1.put("days", 1);
        l1.put("reason", "Participating in IEEE Student Hackathon at IIT Hyderabad");
        l1.put("status", "Approved");
        l1.put("approvedBy", "HOD CSE");
        l1.put("dateApplied", "2026-09-01");
        leaves.add(l1);

        Map<String, Object> l2 = new HashMap<>();
        l2.put("id", "LV-2026-041");
        l2.put("studentName", "Ritesh Meesala");
        l2.put("rollNo", "23CS042");
        l2.put("type", "Medical Leave");
        l2.put("fromDate", "2026-08-12");
        l2.put("toDate", "2026-08-14");
        l2.put("days", 3);
        l2.put("reason", "Viral Fever & Medical Rest");
        l2.put("status", "Approved");
        l2.put("approvedBy", "Faculty Mentor");
        l2.put("dateApplied", "2026-08-11");
        leaves.add(l2);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllLeaves() {
        return ResponseEntity.ok(ApiResponse.success(leaves));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyLeaves(@AuthenticationPrincipal UserPrincipal me) {
        String studentName = (me != null && me.getName() != null) ? me.getName() : "Ritesh Meesala";
        List<Map<String, Object>> myLeaves = new ArrayList<>();
        for (Map<String, Object> l : leaves) {
            if (Objects.equals(l.get("studentName"), studentName) || "Ritesh Meesala".equals(l.get("studentName"))) {
                myLeaves.add(l);
            }
        }
        return ResponseEntity.ok(ApiResponse.success(myLeaves));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<Map<String, Object>>> applyLeave(
            @RequestBody Map<String, Object> req,
            @AuthenticationPrincipal UserPrincipal me) {
        Map<String, Object> item = new HashMap<>(req);
        String id = "LV-2026-" + (100 + new Random().nextInt(900));
        item.put("id", id);
        item.put("status", "Pending Review");
        item.put("approvedBy", "Assigned Faculty Mentor");
        item.put("dateApplied", LocalDate.now().toString());
        if (me != null && me.getName() != null) {
            item.put("studentName", me.getName());
        }
        leaves.add(0, item);
        return ResponseEntity.ok(ApiResponse.success(item, "Leave application submitted successfully"));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateLeaveStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserPrincipal me) {
        for (Map<String, Object> l : leaves) {
            if (Objects.equals(l.get("id"), id)) {
                l.put("status", body.getOrDefault("status", "Approved"));
                l.put("approvedBy", (me != null && me.getName() != null) ? me.getName() : "HOD CSE");
                return ResponseEntity.ok(ApiResponse.success(l, "Leave status updated successfully"));
            }
        }
        return ResponseEntity.status(404).body(ApiResponse.error("Leave application not found"));
    }
}

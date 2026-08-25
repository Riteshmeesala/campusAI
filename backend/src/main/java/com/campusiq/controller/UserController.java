package com.campusiq.controller;

import com.campusiq.dto.response.ApiResponse;
import com.campusiq.entity.Role;
import com.campusiq.entity.User;
import com.campusiq.exception.ResourceNotFoundException;
import com.campusiq.repository.UserRepository;
import com.campusiq.security.UserPrincipal;
import com.campusiq.service.ResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/users") @RequiredArgsConstructor
public class UserController {
    private final UserRepository  userRepository;
    private final ResultService   resultService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<List<User>>> getStudents(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String section) {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        if (department != null && !department.isBlank() && !department.equalsIgnoreCase("ALL")) {
            students = students.stream()
                    .filter(s -> s.getDepartment() != null && s.getDepartment().equalsIgnoreCase(department.trim()))
                    .toList();
        }
        if (semester != null && semester > 0) {
            students = students.stream()
                    .filter(s -> s.getSemester() != null && s.getSemester().equals(semester))
                    .toList();
        }
        if (section != null && !section.isBlank() && !section.equalsIgnoreCase("ALL")) {
            students = students.stream()
                    .filter(s -> s.getSection() != null && s.getSection().equalsIgnoreCase(section.trim()))
                    .toList();
        }
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/faculty")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<List<User>>> getFaculty() {
        return ResponseEntity.ok(ApiResponse.success(userRepository.findByRole(Role.FACULTY)));
    }

    // ── ADMIN: CREATE STUDENT ────────────────────────────────────────────
    @PostMapping("/students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> createStudent(@RequestBody Map<String, Object> body) {
        String username = body.getOrDefault("username", "").toString().trim();
        String email    = body.getOrDefault("email", "").toString().trim();
        if (username.isEmpty() || email.isEmpty())
            return ResponseEntity.badRequest().body(ApiResponse.error("Username and email required"));
        if (userRepository.existsByUsername(username))
            return ResponseEntity.status(409).body(ApiResponse.error("Username already taken"));
        if (userRepository.existsByEmail(email))
            return ResponseEntity.status(409).body(ApiResponse.error("Email already in use"));

        Integer sem = body.get("semester") != null ? Integer.valueOf(body.get("semester").toString()) : 4;
        String sec  = body.getOrDefault("section", "Section A").toString();

        User user = User.builder()
            .username(username)
            .name(body.getOrDefault("name", username).toString())
            .email(email)
            .password(passwordEncoder.encode(body.getOrDefault("password", "campusiq@1234").toString()))
            .role(Role.STUDENT)
            .phoneNumber(body.getOrDefault("phoneNumber", "").toString())
            .department(body.getOrDefault("department", "Computer Science").toString())
            .enrollmentNumber(body.getOrDefault("enrollmentNumber", "").toString())
            .semester(sem)
            .section(sec)
            .active(true).twoFactorEnabled(false).build();
        return ResponseEntity.status(201).body(ApiResponse.success(userRepository.save(user), "Student created"));
    }

    // ── ADMIN: CREATE FACULTY ────────────────────────────────────────────
    @PostMapping("/faculty")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> createFaculty(@RequestBody Map<String, Object> body) {
        String username = body.getOrDefault("username", "").toString().trim();
        String email    = body.getOrDefault("email", "").toString().trim();
        if (username.isEmpty() || email.isEmpty())
            return ResponseEntity.badRequest().body(ApiResponse.error("Username and email required"));
        if (userRepository.existsByUsername(username))
            return ResponseEntity.status(409).body(ApiResponse.error("Username already taken"));
        if (userRepository.existsByEmail(email))
            return ResponseEntity.status(409).body(ApiResponse.error("Email already in use"));

        User user = User.builder()
            .username(username)
            .name(body.getOrDefault("name", username).toString())
            .email(email)
            .password(passwordEncoder.encode(body.getOrDefault("password", "campusiq@1234").toString()))
            .role(Role.FACULTY)
            .phoneNumber(body.getOrDefault("phoneNumber", "").toString())
            .department(body.getOrDefault("department", "Computer Science").toString())
            .enrollmentNumber(body.getOrDefault("employeeId", "").toString())
            .active(true).twoFactorEnabled(false).build();
        return ResponseEntity.status(201).body(ApiResponse.success(userRepository.save(user), "Faculty created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getById(@PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal me) {
        if (me.getUser().getRole() == Role.STUDENT && !me.getUser().getId().equals(id))
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
        User u = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User","id",id));
        return ResponseEntity.ok(ApiResponse.success(u));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> me(@AuthenticationPrincipal UserPrincipal p) {
        return ResponseEntity.ok(ApiResponse.success(p.getUser()));
    }

    @GetMapping("/me/full")
    public ResponseEntity<ApiResponse<Map<String, Object>>> myFullProfile(
            @AuthenticationPrincipal UserPrincipal me) {
        User user = me.getUser();
        Map<String, Object> profile = new HashMap<>();
        profile.put("user", user);
        if (user.getRole() == Role.STUDENT) {
            Map<String, Object> gpa = resultService.getStudentGPA(user.getId());
            profile.put("cgpa", gpa.get("cgpa"));
            profile.put("sgpa", gpa.get("sgpa"));
            profile.put("totalResults", gpa.get("totalResults"));
        }
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/me/profile-image")
    public ResponseEntity<ApiResponse<User>> updateMyProfileImage(
            @AuthenticationPrincipal UserPrincipal me,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(me.getUser().getId())
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", me.getUser().getId()));
        user.setProfileImage(body.get("profileImage"));
        User saved = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(saved, "Profile image updated"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateUser(@PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User","id",id));
        if (body.containsKey("name"))             user.setName(body.get("name").toString());
        if (body.containsKey("email"))            user.setEmail(body.get("email").toString());
        if (body.containsKey("phoneNumber"))      user.setPhoneNumber(body.get("phoneNumber").toString());
        if (body.containsKey("department"))       user.setDepartment(body.get("department").toString());
        if (body.containsKey("section"))          user.setSection(body.get("section") != null ? body.get("section").toString() : null);
        if (body.containsKey("semester"))         user.setSemester(body.get("semester") != null && !body.get("semester").toString().isBlank() ? Integer.valueOf(body.get("semester").toString()) : null);
        if (body.containsKey("enrollmentNumber")) user.setEnrollmentNumber(body.get("enrollmentNumber").toString());
        if (body.containsKey("profileImage"))     user.setProfileImage(body.get("profileImage") != null ? body.get("profileImage").toString() : null);
        if (body.containsKey("active"))           user.setActive(Boolean.parseBoolean(body.get("active").toString()));
        if (body.containsKey("password") && !body.get("password").toString().isBlank())
            user.setPassword(passwordEncoder.encode(body.get("password").toString()));
        return ResponseEntity.ok(ApiResponse.success(userRepository.save(user), "Updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id))
            throw new ResourceNotFoundException("User","id",id);
        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Deleted"));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> stats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", userRepository.countByRole(Role.STUDENT));
        stats.put("totalFaculty",  userRepository.countByRole(Role.FACULTY));
        stats.put("totalUsers",    userRepository.count());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
package com.campusiq.controller;

import com.campusiq.dto.response.ApiResponse;
import com.campusiq.entity.Course;
import com.campusiq.entity.User;
import com.campusiq.exception.ResourceNotFoundException;
import com.campusiq.repository.CourseRepository;
import com.campusiq.repository.UserRepository;
import com.campusiq.security.UserPrincipal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseRepository courseRepository;
    private final UserRepository   userRepository;

    /** GET /courses  — all authenticated users */
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Course>>> all() {
        return ResponseEntity.ok(ApiResponse.success(courseRepository.findAll()));
    }

    /** GET /courses/{id} */
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Course>> byId(@PathVariable Long id) {
        Course c = courseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        return ResponseEntity.ok(ApiResponse.success(c));
    }

    /** GET /courses/my — faculty sees own courses; admin sees all */
    @GetMapping("/my")
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<List<Course>>> myCourses(
            @AuthenticationPrincipal UserPrincipal me) {
        List<Course> list = me.getRole().name().equals("ADMIN")
            ? courseRepository.findAll()
            : courseRepository.findByFacultyId(me.getId());
        // Fallback: if faculty has no assigned courses, return all
        if (list.isEmpty()) list = courseRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /** GET /courses/faculty/{facultyId} */
    @GetMapping("/faculty/{facultyId}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Course>>> byFaculty(@PathVariable Long facultyId) {
        return ResponseEntity.ok(ApiResponse.success(courseRepository.findByFacultyId(facultyId)));
    }

    /** POST /courses — Faculty and Admin */
    @PostMapping
    @Transactional
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<Course>> create(
            @Valid @RequestBody CourseRequest req,
            @AuthenticationPrincipal UserPrincipal me) {
        boolean exists = courseRepository.findAll().stream()
            .anyMatch(c -> c.getCourseCode().equalsIgnoreCase(req.getCourseCode()));
        if (exists)
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Course code '" + req.getCourseCode() + "' already exists"));

        Long assignedFacultyId = req.getFacultyId();
        if (assignedFacultyId == null && me != null && me.getRole().name().equals("FACULTY")) {
            assignedFacultyId = me.getId();
        }

        User faculty = assignedFacultyId != null
            ? userRepository.findById(assignedFacultyId).orElse(null) : null;

        Course course = Course.builder()
            .courseCode(req.getCourseCode().toUpperCase().trim())
            .courseName(req.getCourseName().trim())
            .description(req.getDescription())
            .creditHours(req.getCreditHours())
            .department(req.getDepartment() != null ? req.getDepartment() : (faculty != null ? faculty.getDepartment() : "General"))
            .faculty(faculty)
            .build();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(courseRepository.save(course), "Course created successfully"));
    }

    /** PUT /courses/{id} — Faculty and Admin */
    @PutMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<Course>> update(
            @PathVariable Long id,
            @RequestBody CourseRequest req,
            @AuthenticationPrincipal UserPrincipal me) {
        Course c = courseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        if (req.getCourseName()  != null) c.setCourseName(req.getCourseName().trim());
        if (req.getDescription() != null) c.setDescription(req.getDescription());
        if (req.getCreditHours() != null) c.setCreditHours(req.getCreditHours());
        if (req.getDepartment()  != null) c.setDepartment(req.getDepartment());
        if (req.getFacultyId()   != null) {
            c.setFaculty(userRepository.findById(req.getFacultyId()).orElse(null));
        } else if (c.getFaculty() == null && me != null && me.getRole().name().equals("FACULTY")) {
            c.setFaculty(userRepository.findById(me.getId()).orElse(null));
        }
        return ResponseEntity.ok(ApiResponse.success(courseRepository.save(c), "Course updated successfully"));
    }

    /** DELETE /courses/{id} — Faculty and Admin */
    @DeleteMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal me) {
        Course c = courseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        
        // If faculty, only allow deleting their own courses or admin can delete any
        if (me != null && me.getRole().name().equals("FACULTY")) {
            if (c.getFaculty() != null && !c.getFaculty().getId().equals(me.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You can only delete your own subjects"));
            }
        }

        courseRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Course deleted successfully"));
    }

    @Data
    public static class CourseRequest {
        @NotBlank private String  courseCode;
        @NotBlank private String  courseName;
        private String  description;
        private Integer creditHours;
        private String  department;
        private Long    facultyId;
    }
}
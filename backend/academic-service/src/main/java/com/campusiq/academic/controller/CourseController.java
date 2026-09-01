package com.campusiq.academic.controller;

import com.campusiq.academic.entity.Course;
import com.campusiq.academic.entity.User;
import com.campusiq.academic.repository.CourseRepository;
import com.campusiq.academic.repository.UserRepository;
import com.campusiq.common.dto.ApiResponse;
import com.campusiq.common.exception.ResourceNotFoundException;
import com.campusiq.common.security.UserPrincipal;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
public class CourseController {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseController(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Course>>> all() {
        return ResponseEntity.ok(ApiResponse.success(courseRepository.findAll()));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Course>> byId(@PathVariable Long id) {
        Course c = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        return ResponseEntity.ok(ApiResponse.success(c));
    }

    @GetMapping("/my")
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<List<Course>>> myCourses(
            @AuthenticationPrincipal UserPrincipal me) {
        List<Course> list = (me != null && me.getRole().name().equals("ADMIN"))
                ? courseRepository.findAll()
                : (me != null ? courseRepository.findByFacultyId(me.getId()) : List.of());
        if (list.isEmpty()) list = courseRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/faculty/{facultyId}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Course>>> byFaculty(@PathVariable Long facultyId) {
        return ResponseEntity.ok(ApiResponse.success(courseRepository.findByFacultyId(facultyId)));
    }

    @PostMapping
    @Transactional
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<Course>> create(
            @RequestBody CourseRequest req,
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
                .courseCode(req.getCourseCode() != null ? req.getCourseCode().toUpperCase().trim() : "")
                .courseName(req.getCourseName() != null ? req.getCourseName().trim() : "")
                .description(req.getDescription())
                .creditHours(req.getCreditHours())
                .department(req.getDepartment() != null ? req.getDepartment() : (faculty != null ? faculty.getDepartment() : "General"))
                .faculty(faculty)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(courseRepository.save(course), "Course created successfully"));
    }

    @PutMapping("/{id}")
    @Transactional
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<Course>> update(
            @PathVariable Long id,
            @RequestBody CourseRequest req) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));

        if (req.getCourseCode() != null) course.setCourseCode(req.getCourseCode().toUpperCase().trim());
        if (req.getCourseName() != null) course.setCourseName(req.getCourseName().trim());
        if (req.getDescription() != null) course.setDescription(req.getDescription());
        if (req.getCreditHours() != null) course.setCreditHours(req.getCreditHours());
        if (req.getDepartment() != null) course.setDepartment(req.getDepartment());

        if (req.getFacultyId() != null) {
            User faculty = userRepository.findById(req.getFacultyId()).orElse(null);
            course.setFaculty(faculty);
        }

        return ResponseEntity.ok(ApiResponse.success(courseRepository.save(course), "Course updated"));
    }

    @DeleteMapping("/{id}")
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!courseRepository.existsById(id))
            throw new ResourceNotFoundException("Course", "id", id);
        courseRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Course deleted"));
    }

    public static class CourseRequest {
        @NotBlank
        private String courseCode;
        @NotBlank
        private String courseName;
        private String description;
        private Integer creditHours = 3;
        private String department;
        private Long facultyId;

        public CourseRequest() {}
        public String getCourseCode() { return courseCode; }
        public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getCreditHours() { return creditHours; }
        public void setCreditHours(Integer creditHours) { this.creditHours = creditHours; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public Long getFacultyId() { return facultyId; }
        public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
    }
}

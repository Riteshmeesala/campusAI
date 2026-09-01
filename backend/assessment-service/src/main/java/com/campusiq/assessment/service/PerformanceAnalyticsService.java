package com.campusiq.assessment.service;

import com.campusiq.assessment.dto.PerformanceAnalyticsResponse;
import com.campusiq.assessment.dto.PerformanceAnalyticsResponse.CoursePerformance;
import com.campusiq.assessment.entity.Course;
import com.campusiq.assessment.entity.Result;
import com.campusiq.assessment.entity.User;
import com.campusiq.assessment.repository.CourseRepository;
import com.campusiq.assessment.repository.ResultRepository;
import com.campusiq.assessment.repository.UserRepository;
import com.campusiq.common.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.OptionalDouble;

@Service
public class PerformanceAnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(PerformanceAnalyticsService.class);

    private final UserRepository userRepository;
    private final ResultRepository resultRepository;
    private final CourseRepository courseRepository;
    private final StudentSuggestionService suggestionService;

    public PerformanceAnalyticsService(UserRepository userRepository,
                                       ResultRepository resultRepository,
                                       CourseRepository courseRepository,
                                       StudentSuggestionService suggestionService) {
        this.userRepository = userRepository;
        this.resultRepository = resultRepository;
        this.courseRepository = courseRepository;
        this.suggestionService = suggestionService;
    }

    @Transactional(readOnly = true)
    public PerformanceAnalyticsResponse analyzeStudentPerformance(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        List<Result> allResults = resultRepository.findByStudentId(studentId);
        List<Course> courses = courseRepository.findAll();

        OptionalDouble avgOpt = allResults.stream()
                .filter(r -> r.getPercentage() != null)
                .mapToDouble(r -> r.getPercentage().doubleValue())
                .average();

        BigDecimal overallPercentage = avgOpt.isPresent()
                ? BigDecimal.valueOf(avgOpt.getAsDouble()).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        List<CoursePerformance> coursePerformances = new ArrayList<>();

        for (Course course : courses) {
            List<Result> courseResults = resultRepository.findByStudentIdAndCourseId(
                    studentId, course.getId());
            if (courseResults.isEmpty()) continue;

            OptionalDouble courseAvg = courseResults.stream()
                    .filter(r -> r.getPercentage() != null)
                    .mapToDouble(r -> r.getPercentage().doubleValue())
                    .average();

            BigDecimal coursePct = courseAvg.isPresent()
                    ? BigDecimal.valueOf(courseAvg.getAsDouble()).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            coursePerformances.add(CoursePerformance.builder()
                    .courseCode(course.getCourseCode())
                    .courseName(course.getCourseName())
                    .percentage(coursePct)
                    .grade(calculateGrade(coursePct))
                    .attendanceCount(0)
                    .totalClasses(0)
                    .attendancePercent(BigDecimal.valueOf(85.0))
                    .build());
        }

        BigDecimal attendancePercentage = BigDecimal.valueOf(85.0);

        String category = suggestionService.determineCategory(overallPercentage);
        List<String> suggestions = suggestionService.generateSuggestions(
                overallPercentage, attendancePercentage);
        String priorityAction = suggestionService.getPriorityAction(
                overallPercentage, attendancePercentage);

        log.info("Performance analysis for student: {} - Category: {}", studentId, category);

        return PerformanceAnalyticsResponse.builder()
                .studentId(studentId)
                .studentName(student.getName())
                .enrollmentNumber(student.getEnrollmentNumber())
                .overallPercentage(overallPercentage)
                .performanceCategory(category)
                .attendancePercentage(attendancePercentage)
                .coursePerformances(coursePerformances)
                .suggestions(suggestions)
                .priorityAction(priorityAction)
                .build();
    }

    private String calculateGrade(BigDecimal percentage) {
        double pct = percentage.doubleValue();
        if (pct >= 90) return "A+";
        if (pct >= 80) return "A";
        if (pct >= 70) return "B+";
        if (pct >= 60) return "B";
        if (pct >= 50) return "C";
        if (pct >= 40) return "D";
        return "F";
    }
}

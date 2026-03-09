package com.campusiq.service;

import com.campusiq.dto.response.PerformanceAnalyticsResponse;
import com.campusiq.dto.response.PerformanceAnalyticsResponse.CoursePerformance;
import com.campusiq.entity.Course;
import com.campusiq.entity.Result;
import com.campusiq.entity.User;
import com.campusiq.exception.ResourceNotFoundException;
import com.campusiq.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service @RequiredArgsConstructor @Slf4j
public class PerformanceAnalyticsService {

    private final UserRepository userRepository;
    private final ResultRepository resultRepository;
    private final AttendanceRepository attendanceRepository;
    private final CourseRepository courseRepository;
    private final StudentSuggestionService suggestionService;

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
        long totalPresent = 0, totalClasses = 0;

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

            long present = attendanceRepository.countPresentByStudentAndCourse(
                    studentId, course.getId());
            long total = attendanceRepository.countTotalByStudentAndCourse(
                    studentId, course.getId());
            totalPresent += present;
            totalClasses += total;

            BigDecimal attendPct = total > 0
                    ? BigDecimal.valueOf(present)
                        .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            coursePerformances.add(CoursePerformance.builder()
                    .courseCode(course.getCourseCode())
                    .courseName(course.getCourseName())
                    .percentage(coursePct)
                    .grade(calculateGrade(coursePct))
                    .attendanceCount(present)
                    .totalClasses(total)
                    .attendancePercent(attendPct)
                    .build());
        }

        BigDecimal attendancePercentage = totalClasses > 0
                ? BigDecimal.valueOf(totalPresent)
                    .divide(BigDecimal.valueOf(totalClasses), 2, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

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

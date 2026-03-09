package com.campusiq.service;

import com.campusiq.dto.request.AttendanceRequest;
import com.campusiq.entity.*;
import com.campusiq.entity.Attendance.AttendanceStatus;
import com.campusiq.exception.ResourceNotFoundException;
import com.campusiq.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service @RequiredArgsConstructor @Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository       userRepository;
    private final CourseRepository     courseRepository;

    @Transactional
    public List<Attendance> markAttendance(AttendanceRequest req, Long markedById) {
        Course course = courseRepository.findById(req.getCourseId())
            .orElseThrow(() -> new ResourceNotFoundException("Course","id",req.getCourseId()));
        User markedBy = userRepository.findById(markedById)
            .orElseThrow(() -> new ResourceNotFoundException("User","id",markedById));

        List<Attendance> saved = new ArrayList<>();
        for (var entry : req.getRecords().entrySet()) {
            Long studentId = entry.getKey();
            AttendanceStatus status = entry.getValue();
            User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student","id",studentId));

            Optional<Attendance> existing = attendanceRepository
                .findByStudentIdAndCourseIdAndAttendanceDate(studentId, req.getCourseId(), req.getAttendanceDate());

            Attendance att;
            if (existing.isPresent()) {
                att = existing.get();
                att.setStatus(status);
                att.setRemarks(req.getRemarks());
            } else {
                att = Attendance.builder()
                    .student(student).course(course)
                    .attendanceDate(req.getAttendanceDate())
                    .status(status).remarks(req.getRemarks())
                    .markedBy(markedBy).build();
            }
            saved.add(attendanceRepository.save(att));
        }
        return saved;
    }

    public List<Attendance> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    public List<Attendance> getStudentCourseAttendance(Long studentId, Long courseId) {
        return attendanceRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    public BigDecimal getPercentage(Long studentId, Long courseId) {
        long present = attendanceRepository.countPresentByStudentAndCourse(studentId, courseId);
        long total   = attendanceRepository.countTotalByStudentAndCourse(studentId, courseId);
        if (total == 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(present)
            .divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100));
    }

    public List<Attendance> getCourseAttendanceByDate(Long courseId, LocalDate date) {
        return attendanceRepository.findByCourseIdAndAttendanceDate(courseId, date);
    }
}

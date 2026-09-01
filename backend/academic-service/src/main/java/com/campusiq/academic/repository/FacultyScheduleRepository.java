package com.campusiq.academic.repository;

import com.campusiq.academic.entity.Course;
import com.campusiq.academic.entity.FacultySchedule;
import com.campusiq.academic.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FacultyScheduleRepository extends JpaRepository<FacultySchedule, Long> {
    List<FacultySchedule> findByFacultyId(Long facultyId);
    List<FacultySchedule> findByFacultyIdAndScheduleDate(Long facultyId, LocalDate date);
    List<FacultySchedule> findByCourseId(Long courseId);
    List<FacultySchedule> findByFacultyIdAndCourseId(Long facultyId, Long courseId);
    List<FacultySchedule> findByCourseOrderByScheduleDateDesc(Course course);
    List<FacultySchedule> findByFacultyAndScheduleDateOrderByCreatedAtDesc(User faculty, LocalDate date);
    List<FacultySchedule> findByScheduleDateBetweenOrderByScheduleDateDesc(LocalDate start, LocalDate end);
}

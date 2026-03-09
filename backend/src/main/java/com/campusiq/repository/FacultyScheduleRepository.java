package com.campusiq.repository;

import com.campusiq.entity.FacultySchedule;
import com.campusiq.entity.User;
import com.campusiq.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FacultyScheduleRepository extends JpaRepository<FacultySchedule, Long> {
    List<FacultySchedule> findByFacultyOrderByScheduleDateDesc(User faculty);
    List<FacultySchedule> findByCourseOrderByScheduleDateDesc(Course course);
    List<FacultySchedule> findByFacultyAndCourseOrderByScheduleDateDesc(User faculty, Course course);
    List<FacultySchedule> findByScheduleDateBetweenOrderByScheduleDateDesc(LocalDate start, LocalDate end);
    List<FacultySchedule> findByFacultyAndScheduleDateOrderByCreatedAtDesc(User faculty, LocalDate date);

    @Query("SELECT fs FROM FacultySchedule fs WHERE fs.faculty.id = :facultyId ORDER BY fs.scheduleDate DESC")
    List<FacultySchedule> findByFacultyId(@Param("facultyId") Long facultyId);
}

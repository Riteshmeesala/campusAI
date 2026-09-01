package com.campusiq.academic.repository;

import com.campusiq.academic.entity.Attendance;
import com.campusiq.academic.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudentOrderByAttendanceDateDesc(User student);

    @Query("SELECT a FROM Attendance a WHERE a.student = :student ORDER BY a.attendanceDate DESC")
    List<Attendance> findByStudentOrderByDateDesc(@Param("student") User student);

    List<Attendance> findByStudentId(Long studentId);
    List<Attendance> findByStudentIdAndCourseId(Long studentId, Long courseId);
    List<Attendance> findByCourseIdAndAttendanceDate(Long courseId, LocalDate date);
    Optional<Attendance> findByStudentIdAndCourseIdAndAttendanceDate(Long s, Long c, LocalDate d);

    @Query("SELECT a FROM Attendance a WHERE a.student.id = :sid AND a.attendanceDate BETWEEN :from AND :to ORDER BY a.attendanceDate DESC")
    List<Attendance> findByStudentAndDateRange(@Param("sid") Long sid,
                                               @Param("from") LocalDate from,
                                               @Param("to") LocalDate to);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :sid AND a.course.id = :cid AND (a.status = 'PRESENT' OR a.status = 'LATE')")
    long countPresentByStudentAndCourse(@Param("sid") Long sid, @Param("cid") Long cid);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :sid AND a.course.id = :cid")
    long countTotalByStudentAndCourse(@Param("sid") Long sid, @Param("cid") Long cid);
}

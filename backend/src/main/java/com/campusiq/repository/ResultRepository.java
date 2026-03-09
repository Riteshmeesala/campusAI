package com.campusiq.repository;

import com.campusiq.entity.Result;
import com.campusiq.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {

    List<Result> findByStudentOrderByCreatedAtDesc(User student);
    List<Result> findByExamIdOrderByPercentageDesc(Long examId);
    Optional<Result> findByStudentAndExamId(User student, Long examId);

    @Query("SELECT r FROM Result r WHERE r.student.id = :sid ORDER BY r.createdAt DESC")
    List<Result> findByStudentId(@Param("sid") Long studentId);

    @Query("SELECT r FROM Result r WHERE r.student.id = :sid AND r.resultType = :type ORDER BY r.createdAt DESC")
    List<Result> findByStudentIdAndResultType(@Param("sid") Long studentId, @Param("type") String type);

    @Query("SELECT r FROM Result r WHERE r.student.id = :sid AND r.exam.course.id = :cid ORDER BY r.createdAt DESC")
    List<Result> findByStudentIdAndCourseId(@Param("sid") Long studentId, @Param("cid") Long courseId);

    @Query("SELECT r FROM Result r WHERE r.exam.id = :eid ORDER BY r.percentage DESC")
    List<Result> findByExamId(@Param("eid") Long examId);

    @Query("SELECT COALESCE(AVG(r.gradePoints), 0.0) FROM Result r WHERE r.student.id = :sid AND r.pass = true")
    Double calculateCgpa(@Param("sid") Long studentId);

    @Query("SELECT COALESCE(AVG(r.gradePoints), 0.0) FROM Result r WHERE r.student.id = :sid AND r.exam.semester = :sem AND r.pass = true")
    Double calculateSgpa(@Param("sid") Long studentId, @Param("sem") Integer semester);

    @Query("SELECT r FROM Result r WHERE r.student.id = :sid AND r.exam.semester = :sem ORDER BY r.createdAt DESC")
    List<Result> findByStudentIdAndSemester(@Param("sid") Long studentId, @Param("sem") Integer semester);

    @Query("SELECT r FROM Result r WHERE r.student.id = :sid AND r.exam.course.id = :cid ORDER BY r.createdAt DESC")
    List<Result> findByStudentAndCourse(@Param("sid") Long studentId, @Param("cid") Long courseId);

    // For chatbot: count fails
    @Query("SELECT COUNT(r) FROM Result r WHERE r.student.id = :sid AND r.pass = false")
    long countFailedByStudent(@Param("sid") Long studentId);

    // All results for an exam including student info (for publish view)
    @Query("SELECT r FROM Result r WHERE r.exam.id = :eid ORDER BY r.student.name ASC")
    List<Result> findByExamIdWithStudents(@Param("eid") Long examId);
}
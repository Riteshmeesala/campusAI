package com.campusiq.repository;

import com.campusiq.entity.StudentCgpa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentCgpaRepository extends JpaRepository<StudentCgpa, Long> {

    /** All CGPA records for a student (latest first) */
    @Query("SELECT c FROM StudentCgpa c WHERE c.student.id = :sid ORDER BY c.createdAt DESC")
    List<StudentCgpa> findByStudentId(@Param("sid") Long studentId);

    /** Latest overall CGPA (semester IS NULL) for a student */
    @Query("SELECT c FROM StudentCgpa c WHERE c.student.id = :sid AND c.semester IS NULL ORDER BY c.createdAt DESC")
    List<StudentCgpa> findCgpaByStudentId(@Param("sid") Long studentId);

    /** SGPA records for a student + semester */
    @Query("SELECT c FROM StudentCgpa c WHERE c.student.id = :sid AND c.semester = :sem ORDER BY c.createdAt DESC")
    List<StudentCgpa> findSgpaByStudentIdAndSemester(@Param("sid") Long studentId, @Param("sem") Integer semester);

    /** All records for a specific publish batch (by admin) */
    List<StudentCgpa> findByPublishedByOrderByCreatedAtDesc(Long publishedBy);
}
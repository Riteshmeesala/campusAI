package com.campusiq.assessment.repository;

import com.campusiq.assessment.entity.StudentCgpa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentCgpaRepository extends JpaRepository<StudentCgpa, Long> {

    @Query("SELECT c FROM StudentCgpa c WHERE c.student.id = :sid ORDER BY c.createdAt DESC")
    List<StudentCgpa> findByStudentId(@Param("sid") Long studentId);

    @Query("SELECT c FROM StudentCgpa c WHERE c.student.id = :sid AND c.semester IS NULL ORDER BY c.createdAt DESC")
    List<StudentCgpa> findCgpaByStudentId(@Param("sid") Long studentId);

    @Query("SELECT c FROM StudentCgpa c WHERE c.student.id = :sid AND c.semester = :sem ORDER BY c.createdAt DESC")
    List<StudentCgpa> findSgpaByStudentIdAndSemester(@Param("sid") Long studentId, @Param("sem") Integer semester);

    List<StudentCgpa> findByPublishedByOrderByCreatedAtDesc(Long publishedBy);

    void deleteByStudentIdAndSemester(Long studentId, Integer semester);

    void deleteByStudentIdAndSemesterIsNull(Long studentId);
}

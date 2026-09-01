package com.campusiq.assessment.repository;

import com.campusiq.assessment.entity.StudentSemesterSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentSemesterSummaryRepository extends JpaRepository<StudentSemesterSummary, Long> {
    List<StudentSemesterSummary> findByStudentIdOrderBySemesterNumAsc(Long studentId);
    Optional<StudentSemesterSummary> findByStudentIdAndSemesterCode(Long studentId, String semesterCode);
    void deleteByStudentId(Long studentId);
}

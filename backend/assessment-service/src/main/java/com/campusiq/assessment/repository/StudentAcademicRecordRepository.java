package com.campusiq.assessment.repository;

import com.campusiq.assessment.entity.StudentAcademicRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAcademicRecordRepository extends JpaRepository<StudentAcademicRecord, Long> {
    List<StudentAcademicRecord> findByStudentIdOrderBySemesterNumAscSubjectCodeAsc(Long studentId);
    List<StudentAcademicRecord> findByStudentIdAndSemesterCodeOrderBySubjectCodeAsc(Long studentId, String semesterCode);
    Optional<StudentAcademicRecord> findByStudentIdAndSemesterCodeAndSubjectCode(Long studentId, String semesterCode, String subjectCode);
    void deleteByStudentId(Long studentId);
}

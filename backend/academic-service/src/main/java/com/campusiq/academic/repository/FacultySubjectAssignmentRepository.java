package com.campusiq.academic.repository;

import com.campusiq.academic.entity.FacultySubjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacultySubjectAssignmentRepository extends JpaRepository<FacultySubjectAssignment, Long> {
    List<FacultySubjectAssignment> findByFacultyId(Long facultyId);
    List<FacultySubjectAssignment> findByDepartment(String department);
    List<FacultySubjectAssignment> findBySemesterCode(String semesterCode);
    List<FacultySubjectAssignment> findByActive(Boolean active);
    List<FacultySubjectAssignment> findByFacultyIdAndActive(Long facultyId, Boolean active);
}

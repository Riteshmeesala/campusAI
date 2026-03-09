package com.campusiq.service;

import com.campusiq.dto.request.CgpaUploadRequest;
import com.campusiq.entity.StudentCgpa;
import com.campusiq.entity.User;
import com.campusiq.exception.BadRequestException;
import com.campusiq.exception.ResourceNotFoundException;
import com.campusiq.repository.StudentCgpaRepository;
import com.campusiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CgpaService {

    private final StudentCgpaRepository cgpaRepository;
    private final UserRepository        userRepository;

    private static final BigDecimal MAX_CGPA = BigDecimal.valueOf(10.00);

    /**
     * Admin-only: bulk publish CGPA / SGPA values for multiple students.
     *
     * @param req         contains studentCgpaMap, optional semester, optional remarks
     * @param adminUserId the authenticated admin's user-id
     * @return list of saved StudentCgpa records
     */
    @Transactional
    public List<StudentCgpa> publishCgpa(CgpaUploadRequest req, Long adminUserId) {

        if (req.getStudentCgpaMap() == null || req.getStudentCgpaMap().isEmpty()) {
            throw new BadRequestException("Student CGPA map must not be empty");
        }

        List<StudentCgpa> saved = new ArrayList<>();

        for (Map.Entry<Long, BigDecimal> entry : req.getStudentCgpaMap().entrySet()) {
            Long       studentId = entry.getKey();
            BigDecimal cgpa      = entry.getValue();

            if (cgpa == null) continue;

            if (cgpa.compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("CGPA cannot be negative for student " + studentId);
            }
            if (cgpa.compareTo(MAX_CGPA) > 0) {
                throw new BadRequestException("CGPA cannot exceed 10.00 for student " + studentId);
            }

            User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

            StudentCgpa record = StudentCgpa.builder()
                .student(student)
                .cgpaValue(cgpa)
                .semester(req.getSemester())       // null = cumulative CGPA
                .publishedBy(adminUserId)
                .remarks(req.getRemarks())
                .build();

            saved.add(cgpaRepository.save(record));

            log.info("[CGPA] admin={} | student={} | semester={} | cgpa={}",
                adminUserId, student.getName(), req.getSemester(), cgpa);
        }

        return saved;
    }

    /** Fetch all CGPA records for a student (student self-view or admin view) */
    @Transactional(readOnly = true)
    public List<StudentCgpa> getStudentCgpa(Long studentId) {
        return cgpaRepository.findByStudentId(studentId);
    }

    /** Fetch all CGPA records across all students (admin view) */
    @Transactional(readOnly = true)
    public List<StudentCgpa> getAllCgpa() {
        return cgpaRepository.findAll();
    }
}
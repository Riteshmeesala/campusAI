package com.campusiq.assessment.service;

import com.campusiq.assessment.dto.CgpaUploadRequest;
import com.campusiq.assessment.entity.StudentCgpa;
import com.campusiq.assessment.entity.User;
import com.campusiq.assessment.repository.StudentCgpaRepository;
import com.campusiq.assessment.repository.StudentSemesterSummaryRepository;
import com.campusiq.assessment.repository.UserRepository;
import com.campusiq.common.exception.BadRequestException;
import com.campusiq.common.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CgpaService {

    private static final Logger log = LoggerFactory.getLogger(CgpaService.class);

    private final StudentCgpaRepository cgpaRepository;
    private final UserRepository userRepository;
    private final StudentSemesterSummaryRepository summaryRepository;

    private static final BigDecimal MAX_CGPA = BigDecimal.valueOf(10.00);

    public CgpaService(StudentCgpaRepository cgpaRepository,
                       UserRepository userRepository,
                       StudentSemesterSummaryRepository summaryRepository) {
        this.cgpaRepository = cgpaRepository;
        this.userRepository = userRepository;
        this.summaryRepository = summaryRepository;
    }

    @Transactional
    public List<StudentCgpa> publishCgpa(CgpaUploadRequest req, Long adminUserId) {
        if (req.getStudentCgpaMap() == null || req.getStudentCgpaMap().isEmpty()) {
            throw new BadRequestException("Student CGPA map must not be empty");
        }

        List<StudentCgpa> saved = new ArrayList<>();
        Integer semNum = req.getSemester();

        for (Map.Entry<Long, BigDecimal> entry : req.getStudentCgpaMap().entrySet()) {
            Long studentId = entry.getKey();
            BigDecimal cgpa = entry.getValue();

            if (cgpa == null) continue;

            if (cgpa.compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("CGPA cannot be negative for student " + studentId);
            }
            if (cgpa.compareTo(MAX_CGPA) > 0) {
                throw new BadRequestException("CGPA cannot exceed 10.00 for student " + studentId);
            }

            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

            // 1. Single Source of Truth: Find existing record to UPDATE in-place or create only if missing
            StudentCgpa record;
            if (semNum == null) {
                List<StudentCgpa> existing = cgpaRepository.findCgpaByStudentId(studentId);
                if (!existing.isEmpty()) {
                    record = existing.get(0);
                    // Remove any legacy duplicates
                    for (int i = 1; i < existing.size(); i++) {
                        cgpaRepository.delete(existing.get(i));
                    }
                } else {
                    record = new StudentCgpa();
                    record.setStudent(student);
                    record.setSemester(null);
                }
            } else {
                List<StudentCgpa> existing = cgpaRepository.findSgpaByStudentIdAndSemester(studentId, semNum);
                if (!existing.isEmpty()) {
                    record = existing.get(0);
                    for (int i = 1; i < existing.size(); i++) {
                        cgpaRepository.delete(existing.get(i));
                    }
                } else {
                    record = new StudentCgpa();
                    record.setStudent(student);
                    record.setSemester(semNum);
                }
            }

            record.setCgpaValue(cgpa);
            record.setPublishedBy(adminUserId);
            record.setRemarks(req.getRemarks());

            StudentCgpa updatedRecord = cgpaRepository.save(record);
            saved.add(updatedRecord);

            // 2. Synchronize with StudentSemesterSummary so all modules see the identical CGPA
            try {
                List<com.campusiq.assessment.entity.StudentSemesterSummary> summaries =
                        summaryRepository.findByStudentIdOrderBySemesterNumAsc(studentId);
                if (!summaries.isEmpty()) {
                    if (semNum != null) {
                        for (com.campusiq.assessment.entity.StudentSemesterSummary s : summaries) {
                            if (s.getSemesterNum() != null && s.getSemesterNum().equals(semNum)) {
                                s.setSgpa(cgpa);
                                s.setCgpa(cgpa);
                                summaryRepository.save(s);
                                break;
                            }
                        }
                    } else {
                        com.campusiq.assessment.entity.StudentSemesterSummary latest = summaries.get(summaries.size() - 1);
                        latest.setCgpa(cgpa);
                        summaryRepository.save(latest);
                    }
                }
            } catch (Exception ex) {
                log.warn("Could not sync StudentSemesterSummary: {}", ex.getMessage());
            }

            log.info("[CGPA UPDATE] admin={} | student={} (ID: {}) | semester={} | cgpa={}",
                    adminUserId, student.getName(), studentId, semNum, cgpa);
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<StudentCgpa> getStudentCgpa(Long studentId) {
        List<StudentCgpa> all = cgpaRepository.findByStudentId(studentId);
        // Deduplicate in memory by semester to ensure only 1 active record per term / cumulative
        Map<String, StudentCgpa> uniqueMap = new LinkedHashMap<>();
        for (StudentCgpa c : all) {
            String key = c.getSemester() == null ? "CUMULATIVE" : String.valueOf(c.getSemester());
            if (!uniqueMap.containsKey(key)) {
                uniqueMap.put(key, c);
            }
        }
        return new ArrayList<>(uniqueMap.values());
    }

    @Transactional(readOnly = true)
    public List<StudentCgpa> getAllCgpa() {
        List<StudentCgpa> all = cgpaRepository.findAll();
        Map<String, StudentCgpa> uniqueMap = new LinkedHashMap<>();
        for (StudentCgpa c : all) {
            Long sId = c.getStudent() != null ? c.getStudent().getId() : 0L;
            String key = sId + "_" + (c.getSemester() == null ? "CUMULATIVE" : c.getSemester());
            if (!uniqueMap.containsKey(key)) {
                uniqueMap.put(key, c);
            }
        }
        return new ArrayList<>(uniqueMap.values());
    }
}

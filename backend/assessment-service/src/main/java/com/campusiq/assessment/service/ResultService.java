package com.campusiq.assessment.service;

import com.campusiq.assessment.dto.ResultRequest;
import com.campusiq.assessment.entity.Exam;
import com.campusiq.assessment.entity.Result;
import com.campusiq.assessment.entity.StudentAcademicRecord;
import com.campusiq.assessment.entity.StudentSemesterSummary;
import com.campusiq.assessment.entity.User;
import com.campusiq.assessment.repository.ExamRepository;
import com.campusiq.assessment.repository.ResultRepository;
import com.campusiq.assessment.repository.StudentAcademicRecordRepository;
import com.campusiq.assessment.repository.StudentSemesterSummaryRepository;
import com.campusiq.assessment.repository.UserRepository;
import com.campusiq.common.exception.BadRequestException;
import com.campusiq.common.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class ResultService {

    private static final Logger log = LoggerFactory.getLogger(ResultService.class);

    private final ResultRepository resultRepository;
    private final ExamRepository examRepository;
    private final UserRepository userRepository;
    private final StudentAcademicRecordRepository academicRecordRepository;
    private final StudentSemesterSummaryRepository semesterSummaryRepository;
    private final com.campusiq.assessment.repository.StudentCgpaRepository cgpaRepository;

    public ResultService(ResultRepository resultRepository,
                         ExamRepository examRepository,
                         UserRepository userRepository,
                         StudentAcademicRecordRepository academicRecordRepository,
                         StudentSemesterSummaryRepository semesterSummaryRepository,
                         com.campusiq.assessment.repository.StudentCgpaRepository cgpaRepository) {
        this.resultRepository = resultRepository;
        this.examRepository = examRepository;
        this.userRepository = userRepository;
        this.academicRecordRepository = academicRecordRepository;
        this.semesterSummaryRepository = semesterSummaryRepository;
        this.cgpaRepository = cgpaRepository;
    }

    @Transactional
    public List<Result> publishResults(ResultRequest req, String resultType, Long publisherId) {
        String type = (resultType != null && !resultType.isBlank())
                ? resultType.toUpperCase() : "MID";

        Exam exam = examRepository.findById(req.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", req.getExamId()));

        if (req.getStudentMarks() == null || req.getStudentMarks().isEmpty())
            throw new BadRequestException("No student marks provided");

        List<Result> saved = new ArrayList<>();

        for (Map.Entry<Long, BigDecimal> entry : req.getStudentMarks().entrySet()) {
            Long studentId = entry.getKey();
            BigDecimal marks = entry.getValue();
            if (marks == null) continue;

            if (marks.compareTo(BigDecimal.ZERO) < 0)
                throw new BadRequestException("Marks cannot be negative for student " + studentId);
            if (marks.compareTo(BigDecimal.valueOf(exam.getTotalMarks())) > 0)
                throw new BadRequestException(
                        "Marks " + marks + " exceed total " + exam.getTotalMarks() + " for student " + studentId);

            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

            BigDecimal pct = marks
                    .divide(BigDecimal.valueOf(exam.getTotalMarks()), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);

            boolean pass = marks.compareTo(BigDecimal.valueOf(exam.getPassingMarks())) >= 0;
            String grade = computeGrade(pct);
            BigDecimal gPoints = computeGradePoints(pct);

            Optional<Result> existing = resultRepository.findByStudentAndExamId(student, exam.getId());
            Result res;
            if (existing.isPresent()) {
                res = existing.get();
                res.setMarksObtained(marks);
                res.setPercentage(pct);
                res.setGrade(grade);
                res.setPass(pass);
                res.setGradePoints(gPoints);
                res.setRemarks(req.getRemarks());
                res.setResultType(type);
                res.setPublishedBy(publisherId);
            } else {
                res = Result.builder()
                        .student(student)
                        .exam(exam)
                        .marksObtained(marks)
                        .percentage(pct)
                        .grade(grade)
                        .pass(pass)
                        .gradePoints(gPoints)
                        .remarks(req.getRemarks())
                        .resultType(type)
                        .publishedBy(publisherId)
                        .build();
            }
            saved.add(resultRepository.save(res));
            log.info("[Result] {} | student={} | exam={} | marks={} | grade={} | pass={}",
                    type, student.getName(), exam.getExamName(), marks, grade, pass);
        }
        return saved;
    }

    @Transactional
    public List<Result> publishResults(ResultRequest req) {
        return publishResults(req, "MID", null);
    }

    @Transactional(readOnly = true)
    public List<Result> getAllResults() {
        return resultRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Result> getStudentResults(Long studentId) {
        return resultRepository.findByStudentId(studentId);
    }

    @Transactional(readOnly = true)
    public List<Result> getStudentResultsByType(Long studentId, String type) {
        return resultRepository.findByStudentIdAndResultType(studentId, type.toUpperCase());
    }

    public List<Result> getExamResults(Long examId) {
        return resultRepository.findByExamIdOrderByPercentageDesc(examId);
    }

    public List<Result> getStudentCourseResults(Long studentId, Long courseId) {
        return resultRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    /**
     * Get real-time unified GPA data for student from single source of truth
     */
    public Map<String, Object> getStudentGPA(Long studentId) {
        // 1. Check StudentCgpa direct records (null semester first, then latest any semester)
        List<com.campusiq.assessment.entity.StudentCgpa> directCgpa = cgpaRepository.findCgpaByStudentId(studentId);
        if (directCgpa.isEmpty()) {
            directCgpa = cgpaRepository.findByStudentId(studentId);
        }
        Double directCgpaVal = directCgpa.isEmpty() ? null : directCgpa.get(0).getCgpaValue().doubleValue();

        List<StudentSemesterSummary> summaries = semesterSummaryRepository.findByStudentIdOrderBySemesterNumAsc(studentId);
        List<StudentAcademicRecord> allAcademicRecords = academicRecordRepository.findByStudentIdOrderBySemesterNumAscSubjectCodeAsc(studentId);

        StudentSemesterSummary latestSummary = !summaries.isEmpty() ? summaries.get(summaries.size() - 1) : null;
        Double cgpa = directCgpaVal != null
                ? directCgpaVal
                : (latestSummary != null && latestSummary.getCgpa() != null ? latestSummary.getCgpa().doubleValue() : 0.0);
        Double sgpa = latestSummary != null && latestSummary.getSgpa() != null
                ? latestSummary.getSgpa().doubleValue()
                : (directCgpaVal != null ? directCgpaVal : 0.0);

        long passed = allAcademicRecords.stream()
                .filter(r -> r.getGradePoint() != null && r.getGradePoint().compareTo(BigDecimal.ZERO) > 0)
                .count();

        Map<String, Object> gpa = new LinkedHashMap<>();
        gpa.put("studentId", studentId);
        gpa.put("cgpa", round(cgpa));
        gpa.put("sgpa", round(sgpa));
        gpa.put("totalResults", allAcademicRecords.size());
        gpa.put("passedResults", passed);
        gpa.put("failedResults", allAcademicRecords.size() - passed);
        gpa.put("semesterCode", latestSummary != null ? latestSummary.getSemesterCode() : "1-1");
        return gpa;
    }

    public Map<String, Object> getSemesterGPA(Long studentId, Integer semester) {
        String semCode = switch (semester) {
            case 1 -> "1-1";
            case 2 -> "1-2";
            case 3 -> "2-1";
            case 4 -> "2-2";
            case 5 -> "3-1";
            case 6 -> "3-2";
            case 7 -> "4-1";
            case 8 -> "4-2";
            default -> "1-1";
        };

        List<com.campusiq.assessment.entity.StudentCgpa> directSgpa = cgpaRepository.findSgpaByStudentIdAndSemester(studentId, semester);
        Double directSgpaVal = directSgpa.isEmpty() ? null : directSgpa.get(0).getCgpaValue().doubleValue();

        Optional<StudentSemesterSummary> summaryOpt = semesterSummaryRepository.findByStudentIdAndSemesterCode(studentId, semCode);
        if (summaryOpt.isPresent()) {
            StudentSemesterSummary summary = summaryOpt.get();
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("sgpa", directSgpaVal != null ? round(directSgpaVal) : (summary.getSgpa() != null ? round(summary.getSgpa().doubleValue()) : 8.50));
            map.put("cgpa", summary.getCgpa() != null ? round(summary.getCgpa().doubleValue()) : 8.50);
            map.put("semester", semester);
            map.put("semesterCode", semCode);
            map.put("results", academicRecordRepository.findByStudentIdAndSemesterCodeOrderBySubjectCodeAsc(studentId, semCode));
            return map;
        }

        Double sgpa = directSgpaVal != null ? directSgpaVal : resultRepository.calculateSgpa(studentId, semester);
        List<Result> semRes = resultRepository.findByStudentIdAndSemester(studentId, semester);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("sgpa", round(sgpa));
        map.put("semester", semester);
        map.put("results", semRes);
        return map;
    }

    private double round(Double v) { return v != null ? Math.round(v * 100.0) / 100.0 : 0.0; }

    private String computeGrade(BigDecimal pct) {
        double d = pct.doubleValue();
        if (d >= 90) return "S";
        if (d >= 80) return "A";
        if (d >= 70) return "B";
        if (d >= 60) return "C";
        if (d >= 50) return "D";
        if (d >= 40) return "E";
        return "F";
    }

    private BigDecimal computeGradePoints(BigDecimal pct) {
        double d = pct.doubleValue();
        if (d >= 90) return BigDecimal.valueOf(10.0);
        if (d >= 80) return BigDecimal.valueOf(9.0);
        if (d >= 70) return BigDecimal.valueOf(8.0);
        if (d >= 60) return BigDecimal.valueOf(7.0);
        if (d >= 50) return BigDecimal.valueOf(6.0);
        if (d >= 40) return BigDecimal.valueOf(5.0);
        return BigDecimal.ZERO;
    }
}

package com.campusiq.service;

import com.campusiq.dto.request.ResultRequest;
import com.campusiq.entity.*;
import com.campusiq.exception.*;
import com.campusiq.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service @RequiredArgsConstructor @Slf4j
public class ResultService {

    private final ResultRepository resultRepository;
    private final ExamRepository   examRepository;
    private final UserRepository   userRepository;

    // ── PUBLISH ──────────────────────────────────────────────────────────────

    /**
     * Core publish. resultType = "MID" (faculty) or "SEM" (admin only).
     */
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
            Long      studentId = entry.getKey();
            BigDecimal marks    = entry.getValue();
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

            boolean    pass    = marks.compareTo(BigDecimal.valueOf(exam.getPassingMarks())) >= 0;
            String     grade   = computeGrade(pct);
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
                    .student(student).exam(exam)
                    .marksObtained(marks).percentage(pct)
                    .grade(grade).pass(pass).gradePoints(gPoints)
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

    /** Legacy overload (used by old /publish endpoint) */
    @Transactional
    public List<Result> publishResults(ResultRequest req) {
        return publishResults(req, "MID", null);
    }

    // ── READ ─────────────────────────────────────────────────────────────────

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

    public Map<String, Object> getStudentGPA(Long studentId) {
        Double cgpa = resultRepository.calculateCgpa(studentId);
        Double sgpa = resultRepository.calculateSgpa(studentId, 4);
        List<Result> all  = resultRepository.findByStudentId(studentId);
        long passed  = all.stream().filter(r -> Boolean.TRUE.equals(r.getPass())).count();
        Map<String, Object> gpa = new LinkedHashMap<>();
        gpa.put("cgpa",          round(cgpa));
        gpa.put("sgpa",          round(sgpa));
        gpa.put("totalResults",  all.size());
        gpa.put("passedResults", passed);
        gpa.put("failedResults", all.size() - passed);
        return gpa;
    }

    public Map<String, Object> getSemesterGPA(Long studentId, Integer semester) {
        Double sgpa     = resultRepository.calculateSgpa(studentId, semester);
        List<Result> semRes  = resultRepository.findByStudentIdAndSemester(studentId, semester);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("sgpa",     round(sgpa));
        map.put("semester", semester);
        map.put("results",  semRes);
        return map;
    }

    // ── HELPERS ──────────────────────────────────────────────────────────────

    private double round(Double v) { return v != null ? Math.round(v * 100.0) / 100.0 : 0.0; }

    private String computeGrade(BigDecimal pct) {
        double d = pct.doubleValue();
        if (d >= 90) return "O";
        if (d >= 80) return "A+";
        if (d >= 70) return "A";
        if (d >= 60) return "B+";
        if (d >= 50) return "B";
        if (d >= 40) return "C";
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
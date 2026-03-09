package com.campusiq.service;

import com.campusiq.dto.request.ExamRequest;
import com.campusiq.entity.*;
import com.campusiq.exception.ResourceNotFoundException;
import com.campusiq.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service @RequiredArgsConstructor
public class ExamService {
    private final ExamRepository   examRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public Exam createExam(ExamRequest req) {
        Course course = courseRepository.findById(req.getCourseId())
            .orElseThrow(() -> new ResourceNotFoundException("Course","id",req.getCourseId()));
        return examRepository.save(Exam.builder()
            .examName(req.getExamName()).course(course)
            .scheduledDate(req.getScheduledDate())
            .durationMinutes(req.getDurationMinutes())
            .totalMarks(req.getTotalMarks()).passingMarks(req.getPassingMarks())
            .venue(req.getVenue()).description(req.getDescription())
            .status(req.getStatus() != null ? req.getStatus() : Exam.ExamStatus.SCHEDULED)
            .build());
    }

    @Transactional(readOnly = true)
    public List<Exam> getAllExams()              { return examRepository.findAll(); }
    @Transactional(readOnly = true)
    public Exam getById(Long id)               {
        return examRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Exam","id",id));
    }
    @Transactional(readOnly = true)
    public List<Exam> getUpcoming()            {
        return examRepository.findByScheduledDateAfter(LocalDateTime.now());
    }
    @Transactional(readOnly = true)
    public List<Exam> getByCourse(Long cId)   { return examRepository.findByCourseId(cId); }

    @Transactional
    public Exam updateExam(Long id, ExamRequest req) {
        Exam exam = getById(id);
        if (req.getExamName() != null)       exam.setExamName(req.getExamName());
        if (req.getScheduledDate() != null)  exam.setScheduledDate(req.getScheduledDate());
        if (req.getDurationMinutes() != null) exam.setDurationMinutes(req.getDurationMinutes());
        if (req.getTotalMarks() != null)     exam.setTotalMarks(req.getTotalMarks());
        if (req.getPassingMarks() != null)   exam.setPassingMarks(req.getPassingMarks());
        if (req.getVenue() != null)          exam.setVenue(req.getVenue());
        if (req.getStatus() != null)         exam.setStatus(req.getStatus());
        return examRepository.save(exam);
    }

    @Transactional
    public void deleteExam(Long id) { examRepository.deleteById(id); }
}
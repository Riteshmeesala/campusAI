package com.campusiq.assessment.config;

import com.campusiq.assessment.entity.Course;
import com.campusiq.assessment.entity.Exam;
import com.campusiq.assessment.entity.Exam.ExamStatus;
import com.campusiq.assessment.repository.CourseRepository;
import com.campusiq.assessment.repository.ExamRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ExamRepository examRepository;
    private final CourseRepository courseRepository;

    public DataInitializer(ExamRepository examRepository, CourseRepository courseRepository) {
        this.examRepository = examRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public void run(String... args) {
        log.info("Assessment service initialized. Ready for user-created exams, marks, and evaluations.");
    }
}

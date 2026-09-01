package com.campusiq.academic.config;

import com.campusiq.academic.entity.Course;
import com.campusiq.academic.entity.User;
import com.campusiq.academic.repository.CourseRepository;
import com.campusiq.academic.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public DataInitializer(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        log.info("Academic service initialized. Ready for user-created courses and curriculum.");
    }
}

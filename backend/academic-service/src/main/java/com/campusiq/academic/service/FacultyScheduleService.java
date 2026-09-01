package com.campusiq.academic.service;

import com.campusiq.academic.entity.Course;
import com.campusiq.academic.entity.FacultySchedule;
import com.campusiq.academic.entity.User;
import com.campusiq.academic.repository.CourseRepository;
import com.campusiq.academic.repository.FacultyScheduleRepository;
import com.campusiq.academic.repository.UserRepository;
import com.campusiq.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class FacultyScheduleService {

    private final FacultyScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public FacultyScheduleService(FacultyScheduleRepository scheduleRepository,
                                  UserRepository userRepository,
                                  CourseRepository courseRepository) {
        this.scheduleRepository = scheduleRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional
    public FacultySchedule addSchedule(Long facultyId, Long courseId, LocalDate date,
                                        String topic, String subTopics, String chapter,
                                        Double hours, String method, String period, String remarks) {
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", facultyId));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        FacultySchedule schedule = FacultySchedule.builder()
                .faculty(faculty)
                .course(course)
                .scheduleDate(date)
                .topicCovered(topic)
                .subTopics(subTopics)
                .chapterNumber(chapter)
                .durationHours(hours)
                .teachingMethod(method)
                .classPeriod(period)
                .remarks(remarks)
                .build();
        return scheduleRepository.save(schedule);
    }

    public List<FacultySchedule> getFacultySchedules(Long facultyId) {
        return scheduleRepository.findByFacultyId(facultyId);
    }

    public List<FacultySchedule> getCourseSchedules(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        return scheduleRepository.findByCourseOrderByScheduleDateDesc(course);
    }

    public List<FacultySchedule> getFacultyDateSchedules(Long facultyId, LocalDate date) {
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", facultyId));
        return scheduleRepository.findByFacultyAndScheduleDateOrderByCreatedAtDesc(faculty, date);
    }

    public List<FacultySchedule> getAllSchedulesBetween(LocalDate start, LocalDate end) {
        return scheduleRepository.findByScheduleDateBetweenOrderByScheduleDateDesc(start, end);
    }

    @Transactional
    public void deleteSchedule(Long scheduleId) {
        if (!scheduleRepository.existsById(scheduleId))
            throw new ResourceNotFoundException("FacultySchedule", "id", scheduleId);
        scheduleRepository.deleteById(scheduleId);
    }
}

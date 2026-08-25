package com.campusiq.service;

import com.campusiq.entity.Course;
import com.campusiq.entity.TimetableSlot;
import com.campusiq.entity.User;
import com.campusiq.exception.ResourceNotFoundException;
import com.campusiq.repository.CourseRepository;
import com.campusiq.repository.TimetableSlotRepository;
import com.campusiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetableSlotRepository timetableRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public List<TimetableSlot> getFacultyTimetable(Long facultyId) {
        return timetableRepository.findByFacultyId(facultyId);
    }

    @Transactional(readOnly = true)
    public List<TimetableSlot> getFacultyDayTimetable(Long facultyId, String dayOfWeek) {
        return timetableRepository.findByFacultyIdAndDayOfWeek(facultyId, dayOfWeek.toUpperCase());
    }

    @Transactional(readOnly = true)
    public List<TimetableSlot> getCourseTimetable(Long courseId) {
        return timetableRepository.findByCourseId(courseId);
    }

    @Transactional
    public TimetableSlot addSlot(Long facultyId, Map<String, Object> req) {
        User faculty = userRepository.findById(facultyId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", facultyId));

        Long courseId = Long.valueOf(req.get("courseId").toString());
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        String dayOfWeek = req.get("dayOfWeek").toString().toUpperCase().trim();
        String startTime = req.get("startTime").toString().trim();
        String endTime   = req.get("endTime").toString().trim();
        String period    = req.getOrDefault("periodName", "Period 1").toString();
        String room      = req.getOrDefault("roomNo", "").toString();
        String section   = req.getOrDefault("sectionName", "").toString();
        String type      = req.getOrDefault("classType", "Lecture").toString();
        String color     = req.getOrDefault("colorCode", "#3b82f6").toString();

        TimetableSlot slot = TimetableSlot.builder()
                .faculty(faculty)
                .course(course)
                .dayOfWeek(dayOfWeek)
                .startTime(startTime)
                .endTime(endTime)
                .periodName(period)
                .roomNo(room)
                .sectionName(section)
                .classType(type)
                .colorCode(color)
                .build();

        return timetableRepository.save(slot);
    }

    @Transactional
    public TimetableSlot updateSlot(Long slotId, Map<String, Object> req) {
        TimetableSlot slot = timetableRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("TimetableSlot", "id", slotId));

        if (req.containsKey("courseId")) {
            Long courseId = Long.valueOf(req.get("courseId").toString());
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
            slot.setCourse(course);
        }

        if (req.containsKey("dayOfWeek"))   slot.setDayOfWeek(req.get("dayOfWeek").toString().toUpperCase().trim());
        if (req.containsKey("startTime"))   slot.setStartTime(req.get("startTime").toString().trim());
        if (req.containsKey("endTime"))     slot.setEndTime(req.get("endTime").toString().trim());
        if (req.containsKey("periodName"))  slot.setPeriodName(req.get("periodName").toString());
        if (req.containsKey("roomNo"))      slot.setRoomNo(req.get("roomNo").toString());
        if (req.containsKey("sectionName")) slot.setSectionName(req.get("sectionName").toString());
        if (req.containsKey("classType"))   slot.setClassType(req.get("classType").toString());
        if (req.containsKey("colorCode"))   slot.setColorCode(req.get("colorCode").toString());

        return timetableRepository.save(slot);
    }

    @Transactional
    public void deleteSlot(Long slotId) {
        if (!timetableRepository.existsById(slotId)) {
            throw new ResourceNotFoundException("TimetableSlot", "id", slotId);
        }
        timetableRepository.deleteById(slotId);
    }
}

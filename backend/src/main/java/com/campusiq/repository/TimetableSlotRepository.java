package com.campusiq.repository;

import com.campusiq.entity.TimetableSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimetableSlotRepository extends JpaRepository<TimetableSlot, Long> {
    List<TimetableSlot> findByFacultyId(Long facultyId);
    List<TimetableSlot> findByFacultyIdAndDayOfWeek(Long facultyId, String dayOfWeek);
    List<TimetableSlot> findByCourseId(Long courseId);
}

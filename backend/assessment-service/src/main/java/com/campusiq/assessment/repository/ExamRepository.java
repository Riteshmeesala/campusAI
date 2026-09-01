package com.campusiq.assessment.repository;

import com.campusiq.assessment.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByCourseId(Long courseId);
    List<Exam> findByScheduledDateAfter(LocalDateTime date);

    @Query("SELECT e FROM Exam e WHERE e.scheduledDate > :now AND e.status = 'SCHEDULED' ORDER BY e.scheduledDate ASC")
    List<Exam> findUpcoming(@Param("now") LocalDateTime now);

    List<Exam> findByScheduledDateBetween(LocalDateTime now, LocalDateTime plusDays);
}

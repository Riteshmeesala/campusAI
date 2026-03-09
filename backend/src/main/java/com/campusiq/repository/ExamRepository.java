package com.campusiq.repository;

import com.campusiq.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByCourseId(Long courseId);

    List<Exam> findByScheduledDateAfter(LocalDateTime date);

    @org.springframework.data.jpa.repository.Query(
        "SELECT e FROM Exam e WHERE e.scheduledDate > :now AND e.status = 'SCHEDULED' ORDER BY e.scheduledDate ASC"
    )
    List<Exam> findUpcoming(
        @org.springframework.data.repository.query.Param("now") LocalDateTime now
    );

    List<Exam> findByScheduledDateBetween(LocalDateTime now, LocalDateTime plusDays);

}
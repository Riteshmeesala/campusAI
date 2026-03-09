package com.campusiq.repository;
import com.campusiq.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByDepartment(String department);
    List<Course> findByFacultyId(Long facultyId);
}

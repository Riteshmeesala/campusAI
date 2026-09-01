package com.campusiq.assessment.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_code", nullable = false, unique = true, length = 20)
    private String courseCode;

    @Column(name = "course_name", nullable = false, length = 200)
    private String courseName;

    @Column(name = "credit_hours")
    private Integer creditHours;

    @Column(length = 100)
    private String department;

    public Course() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
    public String getCourseName() { return courseName; }
    public void setCourseName(String courseName) { this.courseName = courseName; }
    public Integer getCreditHours() { return creditHours; }
    public void setCreditHours(Integer creditHours) { this.creditHours = creditHours; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}

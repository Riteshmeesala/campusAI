package com.campusiq.academic.entity;

import com.campusiq.common.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "section", length = 50)
    private String section;

    @Column(name = "semester")
    private Integer semester;

    @Column(name = "enrollment_number", length = 50)
    private String enrollmentNumber;

    @Column(name = "is_active")
    private boolean active = true;

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public String getEnrollmentNumber() { return enrollmentNumber; }
    public void setEnrollmentNumber(String enrollmentNumber) { this.enrollmentNumber = enrollmentNumber; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}

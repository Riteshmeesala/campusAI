-- =====================================================================
-- CampusIQ+ Database Schema
-- Run: mysql -u root -p < campusiq_schema.sql
-- NOTE: Demo data is auto-seeded by DataInitializer.java on first startup
-- =====================================================================

DROP DATABASE IF EXISTS campusiq_v6;
CREATE DATABASE campusiq_v6 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campusiq_v6 ;

CREATE TABLE users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('STUDENT','FACULTY','ADMIN') NOT NULL,
    phone_number VARCHAR(15),
    department VARCHAR(100),
    enrollment_number VARCHAR(50),
    is_active TINYINT(1) DEFAULT 1,
    is_two_factor_enabled TINYINT(1) DEFAULT 0,
    otp_code VARCHAR(10),
    otp_expiry DATETIME,
    fcm_token VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_enrollment (enrollment_number),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE courses (
    id BIGINT NOT NULL AUTO_INCREMENT,
    course_code VARCHAR(20) NOT NULL,
    course_name VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    credit_hours INT,
    department VARCHAR(100),
    faculty_id BIGINT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_courses_code (course_code),
    CONSTRAINT fk_courses_faculty FOREIGN KEY (faculty_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendance (
    id BIGINT NOT NULL AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('PRESENT','ABSENT','LATE','EXCUSED') NOT NULL,
    remarks VARCHAR(200),
    marked_by BIGINT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_att_student_course_date (student_id, course_id, attendance_date),
    CONSTRAINT fk_att_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_att_course  FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE exams (
    id BIGINT NOT NULL AUTO_INCREMENT,
    exam_name VARCHAR(200) NOT NULL,
    course_id BIGINT NOT NULL,
    scheduled_date DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    total_marks INT NOT NULL,
    passing_marks INT NOT NULL,
    venue VARCHAR(200),
    status ENUM('SCHEDULED','ONGOING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    description VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_exams_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE results (
    id BIGINT NOT NULL AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    exam_id BIGINT NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    percentage DECIMAL(5,2),
    grade VARCHAR(5),
    is_pass TINYINT(1),
    remarks VARCHAR(500),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_result_student_exam (student_id, exam_id),
    CONSTRAINT fk_results_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_results_exam    FOREIGN KEY (exam_id)    REFERENCES exams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE fees (
    id BIGINT NOT NULL AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    fee_type VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status ENUM('PENDING','PAID','OVERDUE','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    razorpay_order_id VARCHAR(200),
    razorpay_payment_id VARCHAR(200),
    razorpay_signature VARCHAR(500),
    description VARCHAR(500),
    academic_year VARCHAR(20),
    semester VARCHAR(20),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_fees_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    type ENUM('ATTENDANCE','FEE_REMINDER','EXAM_SCHEDULE','RESULT_PUBLISHED',
              'GENERAL','SYSTEM','PAYMENT_SUCCESS','PAYMENT_FAILED') NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    reference_id BIGINT,
    reference_type VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SELECT 'Schema created! Now start the Spring Boot app — DataInitializer will auto-seed all demo data.' AS STATUS;

-- Faculty Schedule table (topic tracking)
CREATE TABLE IF NOT EXISTS faculty_schedules (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  faculty_id BIGINT NOT NULL,
  course_id BIGINT NOT NULL,
  schedule_date DATE NOT NULL,
  topic_covered VARCHAR(300) NOT NULL,
  sub_topics VARCHAR(1000),
  chapter_number VARCHAR(20),
  duration_hours DOUBLE,
  teaching_method VARCHAR(100),
  class_period VARCHAR(10),
  remarks VARCHAR(500),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  INDEX idx_fschedule_faculty (faculty_id),
  INDEX idx_fschedule_course (course_id),
  INDEX idx_fschedule_date (schedule_date)
);

-- Add missing columns to existing tables
ALTER TABLE results ADD COLUMN grade_points DECIMAL(4,2) AFTER grade;
ALTER TABLE exams ADD COLUMN semester INT DEFAULT 4 AFTER description;
ALTER TABLE exams ADD COLUMN exam_type VARCHAR(50) DEFAULT 'MID_SEM' AFTER semester;

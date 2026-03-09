-- ============================================================
-- Migration: Add student_cgpa table
-- Run this against your existing campusiq_schema.sql database
-- ============================================================

CREATE TABLE IF NOT EXISTS student_cgpa (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id   BIGINT         NOT NULL,
    semester     INT            NULL COMMENT 'NULL = cumulative CGPA; 1-8 = SGPA for that semester',
    cgpa_value   DECIMAL(4, 2)  NOT NULL COMMENT '0.00 to 10.00',
    published_by BIGINT         NOT NULL COMMENT 'Admin user id who uploaded this record',
    remarks      VARCHAR(500)   NULL,
    created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cgpa_student  FOREIGN KEY (student_id)   REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_cgpa_admin    FOREIGN KEY (published_by) REFERENCES users(id),

    INDEX idx_cgpa_student (student_id),
    INDEX idx_cgpa_sem     (semester)
);
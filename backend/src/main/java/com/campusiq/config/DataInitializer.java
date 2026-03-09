package com.campusiq.config;

import com.campusiq.entity.*;
import com.campusiq.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

/**
 * Seeds demo data on first startup.
 * ALL users have password: campusiq@1234
 */
@Configuration @RequiredArgsConstructor @Slf4j
public class DataInitializer {

    private final UserRepository         userRepository;
    private final CourseRepository       courseRepository;
    private final AttendanceRepository   attendanceRepository;
    private final ExamRepository         examRepository;
    private final ResultRepository           resultRepository;
    private final FeeRepository          feeRepository;
    private final NotificationRepository    notificationRepository;
    private final FacultyScheduleRepository scheduleRepository;
    private final PasswordEncoder           passwordEncoder;

    @Bean
    public ApplicationRunner seedDatabase() {
        return args -> {
            if (userRepository.count() > 0) {
                log.info("Database already seeded — skipping");
                return;
            }
            log.info("Seeding database with demo data...");
            String pw = passwordEncoder.encode("campusiq@1234");

            // ── USERS ──────────────────────────────────────────────
            User admin = save(User.builder().username("admin").name("System Admin")
                .email("admin@campusiq.com").password(pw).role(Role.ADMIN)
                .phoneNumber("9000000001").department("Administration").active(true).build());

            User fac1 = save(User.builder().username("faculty1").name("Prof. Ramesh Kumar")
                .email("faculty1@campusiq.com").password(pw).role(Role.FACULTY)
                .phoneNumber("9000000002").department("Computer Science")
                .enrollmentNumber("FAC001").active(true).build());

            User fac2 = save(User.builder().username("faculty2").name("Dr. Priya Lakshmi")
                .email("faculty2@campusiq.com").password(pw).role(Role.FACULTY)
                .phoneNumber("9000000003").department("Electronics")
                .enrollmentNumber("FAC002").active(true).build());

            User ravi = save(User.builder().username("ravi2268").name("Ravi Kumar")
                .email("ravi@campusiq.com").password(pw).role(Role.STUDENT)
                .phoneNumber("9876543210").department("Computer Science")
                .enrollmentNumber("23BQ1A1268").active(true).build());

            User priya = save(User.builder().username("priya2269").name("Priya Sharma")
                .email("priya@campusiq.com").password(pw).role(Role.STUDENT)
                .phoneNumber("9876543211").department("Computer Science")
                .enrollmentNumber("23BQ1A1269").active(true).build());

            User anjali = save(User.builder().username("anjali2270").name("Anjali Reddy")
                .email("anjali@campusiq.com").password(pw).role(Role.STUDENT)
                .phoneNumber("9876543212").department("Computer Science")
                .enrollmentNumber("23BQ1A1270").active(true).build());

            save(User.builder().username("farhan2271").name("Mohammed Farhan")
                .email("farhan@campusiq.com").password(pw).role(Role.STUDENT)
                .phoneNumber("9876543213").department("Computer Science")
                .enrollmentNumber("23BQ1A1271").active(true).build());

            save(User.builder().username("sneha2272").name("Sneha Patel")
                .email("sneha@campusiq.com").password(pw).role(Role.STUDENT)
                .phoneNumber("9876543214").department("Computer Science")
                .enrollmentNumber("23BQ1A1272").active(true).build());

            // ── COURSES ────────────────────────────────────────────
            Course cs401 = saveCourse("CS401","Data Structures & Algorithms","Core CS",4,"Computer Science",fac1);
            Course cs402 = saveCourse("CS402","Database Management Systems","SQL, normalization",4,"Computer Science",fac1);
            Course cs403 = saveCourse("CS403","Operating Systems","Process, memory, files",3,"Computer Science",fac2);
            Course cs404 = saveCourse("CS404","Computer Networks","TCP/IP, protocols",3,"Computer Science",fac2);
            Course cs405 = saveCourse("CS405","Software Engineering","SDLC, patterns",3,"Computer Science",fac1);
            Course cs406 = saveCourse("CS406","Machine Learning","Neural nets, ML",3,"Computer Science",fac2);

            // ── ATTENDANCE for RAVI ────────────────────────────────
            String[][] ra401 = {{"2026-01-06","PRESENT"},{"2026-01-08","PRESENT"},{"2026-01-10","PRESENT"},
                {"2026-01-13","PRESENT"},{"2026-01-15","ABSENT"},{"2026-01-17","PRESENT"},
                {"2026-01-20","PRESENT"},{"2026-01-22","PRESENT"},{"2026-01-24","PRESENT"},
                {"2026-01-27","PRESENT"},{"2026-01-29","PRESENT"},{"2026-01-31","ABSENT"},
                {"2026-02-03","PRESENT"},{"2026-02-05","PRESENT"},{"2026-02-07","PRESENT"},{"2026-02-10","PRESENT"}};
            saveAttendance(ravi, cs401, ra401, fac1);

            String[][] ra402 = {{"2026-01-07","PRESENT"},{"2026-01-09","ABSENT"},{"2026-01-12","PRESENT"},
                {"2026-01-14","PRESENT"},{"2026-01-16","ABSENT"},{"2026-01-19","PRESENT"},
                {"2026-01-21","PRESENT"},{"2026-01-23","PRESENT"},{"2026-01-26","ABSENT"},
                {"2026-01-28","PRESENT"},{"2026-01-30","PRESENT"},{"2026-02-02","PRESENT"},
                {"2026-02-04","ABSENT"},{"2026-02-06","PRESENT"},{"2026-02-09","PRESENT"},{"2026-02-11","PRESENT"}};
            saveAttendance(ravi, cs402, ra402, fac1);

            String[][] ra404 = {{"2026-01-07","ABSENT"},{"2026-01-09","PRESENT"},{"2026-01-12","ABSENT"},
                {"2026-01-14","ABSENT"},{"2026-01-16","PRESENT"},{"2026-01-19","ABSENT"},
                {"2026-01-21","PRESENT"},{"2026-01-23","ABSENT"},{"2026-01-26","PRESENT"},
                {"2026-01-28","ABSENT"},{"2026-01-30","ABSENT"},{"2026-02-02","PRESENT"},
                {"2026-02-04","ABSENT"},{"2026-02-06","PRESENT"},{"2026-02-09","PRESENT"},{"2026-02-11","ABSENT"}};
            saveAttendance(ravi, cs404, ra404, fac2);

            // ── ATTENDANCE for PRIYA ───────────────────────────────
            String[][] pa401 = {{"2026-01-06","PRESENT"},{"2026-01-08","PRESENT"},{"2026-01-10","PRESENT"},
                {"2026-01-13","PRESENT"},{"2026-01-15","PRESENT"},{"2026-01-17","PRESENT"},
                {"2026-01-20","PRESENT"},{"2026-01-22","PRESENT"},{"2026-01-24","PRESENT"},
                {"2026-01-27","PRESENT"},{"2026-01-29","ABSENT"},{"2026-01-31","PRESENT"},
                {"2026-02-03","PRESENT"},{"2026-02-05","PRESENT"},{"2026-02-07","PRESENT"},{"2026-02-10","PRESENT"}};
            saveAttendance(priya, cs401, pa401, fac1);

            // ── EXAMS ──────────────────────────────────────────────
            Exam mid401 = examRepository.save(Exam.builder().examName("CS401 Mid-Semester").course(cs401)
                .scheduledDate(LocalDateTime.of(2026,2,15,9,0)).durationMinutes(120)
                .totalMarks(100).passingMarks(40).venue("Hall A").status(Exam.ExamStatus.COMPLETED).build());
            Exam mid402 = examRepository.save(Exam.builder().examName("CS402 Mid-Semester").course(cs402)
                .scheduledDate(LocalDateTime.of(2026,2,17,9,0)).durationMinutes(120)
                .totalMarks(100).passingMarks(40).venue("Hall B").status(Exam.ExamStatus.COMPLETED).build());
            Exam mid404 = examRepository.save(Exam.builder().examName("CS404 Mid-Semester").course(cs404)
                .scheduledDate(LocalDateTime.of(2026,2,20,9,0)).durationMinutes(90)
                .totalMarks(100).passingMarks(40).venue("Hall C").status(Exam.ExamStatus.COMPLETED).build());
            examRepository.save(Exam.builder().examName("CS405 End-Semester").course(cs405)
                .scheduledDate(LocalDateTime.of(2026,3,10,9,0)).durationMinutes(180)
                .totalMarks(100).passingMarks(40).venue("Hall A").status(Exam.ExamStatus.SCHEDULED).build());
            examRepository.save(Exam.builder().examName("CS406 End-Semester").course(cs406)
                .scheduledDate(LocalDateTime.of(2026,3,15,9,0)).durationMinutes(180)
                .totalMarks(100).passingMarks(40).venue("Hall B").status(Exam.ExamStatus.SCHEDULED).build());

            // ── RESULTS ────────────────────────────────────────────
            saveResult(ravi, mid401, "78", "B+", true);
            saveResult(ravi, mid402, "65", "B",  true);
            saveResult(ravi, mid404, "45", "C",  true);
            saveResult(priya, mid401, "92", "A+", true);
            saveResult(priya, mid402, "88", "A",  true);
            saveResult(anjali, mid401, "74", "B+", true);

            // ── FEES ───────────────────────────────────────────────
            feeRepository.save(Fee.builder().student(ravi).feeType("Tuition Fee")
                .amount(new BigDecimal("45000")).dueDate(LocalDate.of(2026,1,31))
                .status(Fee.FeeStatus.PENDING).academicYear("2025-26").semester("4").build());
            feeRepository.save(Fee.builder().student(ravi).feeType("Library Fee")
                .amount(new BigDecimal("2000")).dueDate(LocalDate.of(2026,1,31))
                .paidDate(LocalDate.of(2026,1,20)).status(Fee.FeeStatus.PAID)
                .academicYear("2025-26").semester("4").build());
            feeRepository.save(Fee.builder().student(ravi).feeType("Lab Fee")
                .amount(new BigDecimal("3500")).dueDate(LocalDate.of(2025,12,31))
                .status(Fee.FeeStatus.OVERDUE).academicYear("2025-26").semester("3").build());
            feeRepository.save(Fee.builder().student(priya).feeType("Tuition Fee")
                .amount(new BigDecimal("45000")).dueDate(LocalDate.of(2026,1,31))
                .paidDate(LocalDate.of(2026,1,15)).status(Fee.FeeStatus.PAID)
                .academicYear("2025-26").semester("4").build());

            // ── NOTIFICATIONS ──────────────────────────────────────
            notificationRepository.save(Notification.builder().user(ravi).title("Attendance Warning")
                .message("Your attendance in CS404 is 50% — below 75% minimum. Attend immediately.")
                .type(Notification.NotificationType.ATTENDANCE).read(false).build());
            notificationRepository.save(Notification.builder().user(ravi).title("Fee Overdue")
                .message("Lab Fee ₹3,500 for Sem-3 is overdue. Pay immediately.")
                .type(Notification.NotificationType.FEE_REMINDER).read(false).build());
            notificationRepository.save(Notification.builder().user(ravi).title("Result Published")
                .message("CS401 Mid-Semester: 78% (B+). Check Results page.")
                .type(Notification.NotificationType.RESULT_PUBLISHED).read(true).build());
            notificationRepository.save(Notification.builder().user(priya).title("Exam Scheduled")
                .message("CS405 End-Sem on March 10 at 9:00 AM, Hall A.")
                .type(Notification.NotificationType.EXAM_SCHEDULE).read(false).build());
            notificationRepository.save(Notification.builder().user(admin).title("System Ready")
                .message("CampusIQ+ is running. All services operational.")
                .type(Notification.NotificationType.SYSTEM).read(true).build());

            // ── FACULTY SCHEDULES ─────────────────────────────
            saveSchedule(fac1, cs401, "2026-01-15", "Introduction to Arrays", "1D Arrays, 2D Arrays", "Ch-1", 2.0, "Lecture", "1st", fac1);
            saveSchedule(fac1, cs401, "2026-01-17", "Linked Lists", "Singly LL, Doubly LL", "Ch-2", 2.0, "Lecture", "2nd", fac1);
            saveSchedule(fac1, cs401, "2026-01-20", "Stack & Queue", "Stack operations, Queue using arrays", "Ch-3", 2.0, "Lecture", "1st", fac1);
            saveSchedule(fac1, cs402, "2026-01-16", "ER Diagrams", "Entity-Relation Model basics", "Ch-1", 1.5, "Tutorial", "3rd", fac1);
            saveSchedule(fac2, cs404, "2026-01-15", "OSI Model", "7 layers of OSI", "Ch-1", 2.0, "Lecture", "2nd", fac2);
            saveSchedule(fac2, cs404, "2026-01-19", "TCP/IP Protocol", "TCP vs UDP, IP addressing", "Ch-2", 2.0, "Lecture", "1st", fac2);
            saveSchedule(fac1, cs401, "2026-01-22", "Sorting Algorithms", "Bubble, Selection, Insertion Sort", "Ch-4", 2.0, "Lab", "1st", fac1);
            saveSchedule(fac2, cs406, "2026-01-21", "Introduction to ML", "Supervised vs Unsupervised", "Ch-1", 2.0, "Lecture", "3rd", fac2);

            log.info("✅ Seeded: 8 users, 6 courses, attendance, 5 exams, 6 results, 4 fees, 5 notifications, 8 schedules");
            log.info("   Password for ALL users: campusiq@1234");
        };
    }

    private void saveSchedule(User faculty, Course course, String date, String topic,
                               String subTopics, String chapter, Double hours,
                               String method, String period, User markedBy) {
        scheduleRepository.save(FacultySchedule.builder()
            .faculty(faculty).course(course)
            .scheduleDate(java.time.LocalDate.parse(date))
            .topicCovered(topic).subTopics(subTopics).chapterNumber(chapter)
            .durationHours(hours).teachingMethod(method).classPeriod(period)
            .build());
    }

    private User save(User u) { return userRepository.save(u); }

    private Course saveCourse(String code, String name, String desc, int credits, String dept, User faculty) {
        return courseRepository.save(Course.builder()
            .courseCode(code).courseName(name).description(desc)
            .creditHours(credits).department(dept).faculty(faculty).build());
    }

    private void saveAttendance(User student, Course course, String[][] records, User markedBy) {
        for (String[] a : records) {
            attendanceRepository.save(Attendance.builder()
                .student(student).course(course)
                .attendanceDate(LocalDate.parse(a[0]))
                .status(Attendance.AttendanceStatus.valueOf(a[1]))
                .markedBy(markedBy).build());
        }
    }

    private void saveResult(User student, Exam exam, String marks, String grade, boolean pass) {
        BigDecimal m = new BigDecimal(marks);
        BigDecimal pct = m;  // out of 100
        BigDecimal gp = gradePointsFor(pct.doubleValue());
        resultRepository.save(Result.builder()
            .student(student).exam(exam).marksObtained(m).percentage(pct)
            .grade(grade).pass(pass).gradePoints(gp).build());
    }

    private BigDecimal gradePointsFor(double pct) {
        if (pct >= 90) return BigDecimal.valueOf(10.0);
        if (pct >= 80) return BigDecimal.valueOf(9.0);
        if (pct >= 70) return BigDecimal.valueOf(8.0);
        if (pct >= 60) return BigDecimal.valueOf(7.0);
        if (pct >= 50) return BigDecimal.valueOf(6.0);
        if (pct >= 40) return BigDecimal.valueOf(5.0);
        return BigDecimal.ZERO;
    }
}

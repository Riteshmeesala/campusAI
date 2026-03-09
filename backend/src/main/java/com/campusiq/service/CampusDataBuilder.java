package com.campusiq.service;

import com.campusiq.entity.*;
import com.campusiq.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * FIX: Renamed from DatabaseContextBuilder → CampusDataBuilder
 *
 * Root cause: AIChatbotService contains a static inner class also named
 * 'DatabaseContextBuilder'. Having a top-level public class with the same
 * simple name in the same package causes a compile-time ambiguity error.
 *
 * This class is a Spring @Component that builds DB context text strings.
 * It is kept here for any future use but the primary chatbot flow uses
 * AIChatbotService's own inner static DatabaseContextBuilder.
 *
 * IMPORTANT: If you inject this bean anywhere, use the type CampusDataBuilder.
 */
@Component
@RequiredArgsConstructor
public class CampusDataBuilder {

    private final AttendanceRepository     attendanceRepo;
    private final ResultRepository         resultRepo;
    private final FeeRepository            feeRepo;
    private final ExamRepository           examRepo;
    private final CourseRepository         courseRepo;
    private final UserRepository           userRepo;
    private final FacultyScheduleRepository scheduleRepo;

    public static boolean needsDatabaseContext(String message) {
        String lower = message.toLowerCase();
        String[] triggers = {
            "attendance","present","absent","75","class",
            "marks","result","score","grade","cgpa","gpa","sgpa",
            "fee","payment","pending","due","overdue",
            "exam","test","upcoming","schedule",
            "subject","course","topic","syllabus",
            "profile","department","enrollment",
            "student","faculty","total","count",
            "suggestion","advice","improve","tips",
            "my ","i have","how many","when","what is my",
            "semester","mid","end sem","performance"
        };
        for (String t : triggers) {
            if (lower.contains(t)) return true;
        }
        return false;
    }

    public String buildStudentContext(User student, String message) {
        StringBuilder ctx = new StringBuilder();
        String lower = message.toLowerCase();

        ctx.append("=== STUDENT PROFILE ===\n");
        ctx.append("Name: ").append(student.getName()).append("\n");
        ctx.append("Email: ").append(student.getEmail()).append("\n");
        ctx.append("Enrollment: ").append(nvl(student.getEnrollmentNumber())).append("\n");
        ctx.append("Department: ").append(nvl(student.getDepartment())).append("\n\n");

        buildAttendanceSummary(ctx, student);
        buildGpaSummary(ctx, student);

        if (m(lower,"attend","present","absent","75","class","how many")) buildAttendanceDetail(ctx, student);
        if (m(lower,"mark","result","score","grade","cgpa","gpa","sgpa","mid","sem")) buildResultsDetail(ctx, student);
        if (m(lower,"fee","payment","pending","due","overdue","amount")) buildFeeDetail(ctx, student);
        if (m(lower,"exam","upcoming","test","when")) buildUpcomingExams(ctx);
        if (m(lower,"course","subject","syllabus","topic")) buildCourseDetail(ctx);
        return ctx.toString();
    }

    public String buildFacultyContext(User faculty, String message) {
        StringBuilder ctx = new StringBuilder();
        String lower = message.toLowerCase();
        ctx.append("=== FACULTY PROFILE ===\nName: ").append(faculty.getName())
           .append("\nDept: ").append(nvl(faculty.getDepartment())).append("\n\n");

        long total = userRepo.countByRole(Role.STUDENT);
        ctx.append("Total Students: ").append(total).append("\n\n");

        if (m(lower,"risk","low","75","attend","concern","student","who")) {
            ctx.append("=== STUDENTS AT RISK (below 75%) ===\n");
            int cnt = 0;
            for (User s : userRepo.findByRole(Role.STUDENT)) {
                List<Attendance> att = attendanceRepo.findByStudentOrderByDateDesc(s);
                if (att.isEmpty()) continue;
                long p = att.stream().filter(a ->
                    a.getStatus() == Attendance.AttendanceStatus.PRESENT ||
                    a.getStatus() == Attendance.AttendanceStatus.LATE).count();
                double pct = p * 100.0 / att.size();
                if (pct < 75) {
                    ctx.append(String.format("  %s (%s): %.1f%%\n",
                        s.getName(), nvl(s.getEnrollmentNumber()), pct));
                    cnt++;
                }
            }
            if (cnt == 0) ctx.append("  None - all above 75%!\n");
            ctx.append("\n");
        }
        if (m(lower,"result","mark","grade","performance")) {
            ctx.append("=== STUDENT CGPA ===\n");
            for (User s : userRepo.findByRole(Role.STUDENT)) {
                Double cgpa = resultRepo.calculateCgpa(s.getId());
                if (cgpa != null && cgpa > 0)
                    ctx.append(String.format("  %s: %.2f\n", s.getName(), cgpa));
            }
            ctx.append("\n");
        }
        if (m(lower,"schedule","topic","class","taught")) {
            List<FacultySchedule> sch = scheduleRepo.findByFacultyId(faculty.getId());
            ctx.append("=== YOUR TEACHING SCHEDULE (last 15) ===\n");
            sch.stream().limit(15).forEach(s -> ctx.append(String.format(
                "  %s | %s: %s\n",
                s.getScheduleDate(), s.getCourse().getCourseCode(), s.getTopicCovered())));
            ctx.append("\n");
        }
        if (m(lower,"exam","upcoming")) buildUpcomingExams(ctx);
        return ctx.toString();
    }

    public String buildAdminContext(User admin, String message) {
        StringBuilder ctx = new StringBuilder();
        String lower = message.toLowerCase();
        long ts = userRepo.countByRole(Role.STUDENT), tf = userRepo.countByRole(Role.FACULTY);
        ctx.append(String.format("=== SYSTEM ===\nStudents: %d | Faculty: %d\n\n", ts, tf));

        if (m(lower,"student","list","all")) {
            ctx.append("=== ALL STUDENTS ===\n");
            for (User s : userRepo.findByRole(Role.STUDENT)) {
                Double cgpa = resultRepo.calculateCgpa(s.getId());
                List<Attendance> att = attendanceRepo.findByStudentOrderByDateDesc(s);
                long p = att.stream().filter(a ->
                    a.getStatus() == Attendance.AttendanceStatus.PRESENT ||
                    a.getStatus() == Attendance.AttendanceStatus.LATE).count();
                double pct = att.isEmpty() ? 0 : p * 100.0 / att.size();
                ctx.append(String.format("  %s | %s | %s | Att: %.1f%% | CGPA: %.2f\n",
                    s.getName(), nvl(s.getEnrollmentNumber()), nvl(s.getDepartment()),
                    pct, cgpa != null ? cgpa : 0));
            }
            ctx.append("\n");
        }
        if (m(lower,"faculty","teacher","staff")) {
            ctx.append("=== ALL FACULTY ===\n");
            userRepo.findByRole(Role.FACULTY).forEach(f -> ctx.append(String.format(
                "  %s | %s | %s\n", f.getName(), f.getEmail(), nvl(f.getDepartment()))));
            ctx.append("\n");
        }
        if (m(lower,"fee","payment","revenue","pending")) {
            List<Fee> fees = feeRepo.findAll();
            long paid = fees.stream().filter(f -> f.getStatus() == Fee.FeeStatus.PAID).count();
            long pend = fees.stream().filter(f -> f.getStatus() == Fee.FeeStatus.PENDING).count();
            long over = fees.stream().filter(f -> f.getStatus() == Fee.FeeStatus.OVERDUE).count();
            double amt = fees.stream()
                .filter(f -> f.getStatus() != Fee.FeeStatus.PAID && f.getStatus() != Fee.FeeStatus.CANCELLED)
                .mapToDouble(f -> f.getAmount().doubleValue()).sum();
            ctx.append(String.format(
                "=== FEE SUMMARY ===\nPaid: %d | Pending: %d | Overdue: %d | Outstanding: Rs%.0f\n\n",
                paid, pend, over, amt));
        }
        if (m(lower,"risk","low attend","below 75","concern")) {
            ctx.append("=== AT-RISK STUDENTS ===\n");
            userRepo.findByRole(Role.STUDENT).forEach(s -> {
                List<Attendance> att = attendanceRepo.findByStudentOrderByDateDesc(s);
                if (att.isEmpty()) return;
                long p = att.stream().filter(a ->
                    a.getStatus() == Attendance.AttendanceStatus.PRESENT ||
                    a.getStatus() == Attendance.AttendanceStatus.LATE).count();
                double pct = p * 100.0 / att.size();
                if (pct < 75) ctx.append(String.format("  %s: %.1f%%\n", s.getName(), pct));
            });
            ctx.append("\n");
        }
        if (m(lower,"exam","upcoming")) buildUpcomingExams(ctx);
        return ctx.toString();
    }

    // ── Block builders ──────────────────────────────────────────────────────────

    private void buildAttendanceSummary(StringBuilder ctx, User student) {
        List<Attendance> records = attendanceRepo.findByStudentOrderByDateDesc(student);
        if (records.isEmpty()) { ctx.append("=== ATTENDANCE: No records yet ===\n\n"); return; }
        Map<Long, long[]> map   = new LinkedHashMap<>();
        Map<Long, String> names = new LinkedHashMap<>();
        for (Attendance a : records) {
            Long cid = a.getCourse().getId();
            names.put(cid, a.getCourse().getCourseName() + " (" + a.getCourse().getCourseCode() + ")");
            map.computeIfAbsent(cid, k -> new long[]{0, 0});
            map.get(cid)[1]++;
            if (a.getStatus() == Attendance.AttendanceStatus.PRESENT ||
                a.getStatus() == Attendance.AttendanceStatus.LATE) map.get(cid)[0]++;
        }
        ctx.append("=== ATTENDANCE ===\n");
        for (var e : map.entrySet()) {
            long p = e.getValue()[0], t = e.getValue()[1];
            double pct  = t > 0 ? (p * 100.0 / t) : 0;
            long   need = pct < 75 ? (long) Math.ceil((75.0 * t - 100.0 * p) / 25.0) : 0;
            ctx.append(String.format("%-40s: %d/%d = %.1f%% %s%s\n",
                names.get(e.getKey()), p, t, pct,
                pct < 75 ? "[BELOW 75% - AT RISK]" : "[OK]",
                need > 0 ? " | Need " + need + " more classes" : ""));
        }
        ctx.append("\n");
    }

    private void buildAttendanceDetail(StringBuilder ctx, User student) {
        List<Attendance> records = attendanceRepo.findByStudentOrderByDateDesc(student);
        if (records.isEmpty()) return;
        ctx.append("=== RECENT ATTENDANCE (last 20) ===\n");
        records.stream().limit(20).forEach(a -> ctx.append(String.format(
            "  %s | %s | %s\n",
            a.getAttendanceDate(), a.getCourse().getCourseCode(), a.getStatus())));
        ctx.append("\n");
    }

    private void buildGpaSummary(StringBuilder ctx, User student) {
        Double cgpa = resultRepo.calculateCgpa(student.getId());
        ctx.append(String.format("=== CGPA: %.2f/10.0 ===\n\n", cgpa != null ? cgpa : 0.0));
    }

    private void buildResultsDetail(StringBuilder ctx, User student) {
        List<Result> results = resultRepo.findByStudentId(student.getId());
        if (results.isEmpty()) { ctx.append("=== RESULTS: No results yet ===\n\n"); return; }
        ctx.append("=== EXAM RESULTS ===\n");
        results.forEach(r -> ctx.append(String.format(
            "  [%s] %s - %s: %s/%d | %.1f%% | Grade: %s | %s\n",
            r.getResultType() != null ? r.getResultType() : "MID",
            r.getExam().getCourse().getCourseName(), r.getExam().getExamName(),
            r.getMarksObtained(), r.getExam().getTotalMarks(),
            r.getPercentage() != null ? r.getPercentage().doubleValue() : 0,
            r.getGrade() != null ? r.getGrade() : "N/A",
            Boolean.TRUE.equals(r.getPass()) ? "PASSED" : "FAILED")));
        ctx.append("\n");
    }

    private void buildFeeDetail(StringBuilder ctx, User student) {
        List<Fee> fees = feeRepo.findByStudentOrderByDueDateDesc(student);
        if (fees.isEmpty()) { ctx.append("=== FEES: No records ===\n\n"); return; }
        double pending = fees.stream()
            .filter(f -> f.getStatus() != Fee.FeeStatus.PAID && f.getStatus() != Fee.FeeStatus.CANCELLED)
            .mapToDouble(f -> f.getAmount().doubleValue()).sum();
        ctx.append(String.format("=== FEES | Pending: Rs%.0f ===\n", pending));
        fees.forEach(f -> ctx.append(String.format(
            "  %s: Rs%.0f | %s | Due: %s\n",
            f.getFeeType(), f.getAmount().doubleValue(), f.getStatus(), f.getDueDate())));
        ctx.append("\n");
    }

    private void buildUpcomingExams(StringBuilder ctx) {
        List<Exam> exams = examRepo.findUpcoming(LocalDateTime.now());
        if (exams.isEmpty()) { ctx.append("=== UPCOMING EXAMS: None ===\n\n"); return; }
        ctx.append("=== UPCOMING EXAMS ===\n");
        exams.stream().limit(5).forEach(e -> {
            long days = java.time.temporal.ChronoUnit.DAYS.between(
                LocalDate.now(), e.getScheduledDate().toLocalDate());
            ctx.append(String.format("  %s (%s) - %s | %s | %d marks | %d days away\n",
                e.getExamName(), e.getCourse().getCourseName(),
                e.getScheduledDate().toLocalDate(), nvl(e.getVenue()),
                e.getTotalMarks(), days));
        });
        ctx.append("\n");
    }

    private void buildCourseDetail(StringBuilder ctx) {
        List<Course> courses = courseRepo.findAll();
        ctx.append("=== COURSES ===\n");
        courses.forEach(c -> ctx.append(String.format(
            "  %s - %s (%d credits)\n",
            c.getCourseCode(), c.getCourseName(),
            c.getCreditHours() != null ? c.getCreditHours() : 0)));
        ctx.append("\n");
    }

    private boolean m(String msg, String... kws) {
        for (String k : kws) if (msg.contains(k)) return true;
        return false;
    }

    private String nvl(String v) { return v != null ? v : "N/A"; }
}
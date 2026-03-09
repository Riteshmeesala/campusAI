package com.campusiq.service;

import com.campusiq.entity.*;
import com.campusiq.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                    CampusMate AI — Architecture                         │
 * │                                                                         │
 * │  User                                                                   │
 * │   │                                                                     │
 * │   ▼                                                                     │
 * │  Chat Controller (ChatbotController)                                    │
 * │   │                                                                     │
 * │   ▼                                                                     │
 * │  Intent Detection  (IntentDetector.isCampusQuestion)                   │
 * │   │                                                                     │
 * │   ├── Campus Question ──► Database Service (DatabaseContextBuilder)     │
 * │   │                            │                                        │
 * │   │                            ▼                                        │
 * │   │                       Database Context (MySQL live data)            │
 * │   │                            │                                        │
 * │   └── General Question ◄───────┘                                        │
 * │                    │                                                    │
 * │                    ▼                                                    │
 * │              AI Service (Ollama LOCAL — OllamaService.askAI)            │
 * │              System Prompt = exact template below                       │
 * │              [fallback → ResponseBuilder if Ollama unavailable]         │
 * │                    │                                                    │
 * │                    ▼                                                    │
 * │              Response Builder                                           │
 * │                    │                                                    │
 * │                    ▼                                                    │
 * │              User                                                       │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * System Prompt Template (exact match to specification):
 *
 *   You are CampusMate AI, the intelligent assistant for the CampusIQ platform.
 *   You assist three types of users: 1. Student  2. Faculty  3. Administrator
 *   USER INFORMATION
 *   ----------------
 *   User Name: {USER_NAME}
 *   User Role: {USER_ROLE}
 *   Date: {CURRENT_DATE}
 *
 *   DATABASE CONTEXT
 *   ----------------
 *   {DATABASE_CONTEXT}
 *
 *   RULES …(1–8)
 *   EXAMPLES …
 *
 *   USER QUESTION:
 *   {USER_MESSAGE}
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AIChatbotService {

    // ─── Repositories ────────────────────────────────────────────────────────
    private final UserRepository             userRepo;
    private final AttendanceRepository       attRepo;
    private final ResultRepository           resultRepo;
    private final FeeRepository              feeRepo;
    private final ExamRepository             examRepo;
    private final CourseRepository           courseRepo;
    private final FacultyScheduleRepository  schedRepo;

    // ── Ollama local AI service (replaces all OpenAI fields) ─────────────────
    private final OllamaService ollamaService;

    // ═════════════════════════════════════════════════════════════════════════
    //  ENTRY POINT  (called by ChatbotController)
    //
    //  Returns: Map with keys  →  response, suggestions, timestamp, user,
    //                              role, aiPowered
    //  JSON format delivered to frontend:
    //  { "data": { "response": "...", "suggestions": [...] } }
    // ═════════════════════════════════════════════════════════════════════════

    public Map<String, Object> chat(
        User user,
        String message,
        List<Map<String,String>> history
) {
        if (message == null || message.isBlank()) message = "hello";

        log.info("chat user={} role={} msg={}", user.getUsername(), user.getRole(), message);

        // ── STEP 1: Intent detection ──────────────────────────────────────────
        boolean isCampusQuestion = IntentDetector.isCampusQuestion(message);

        // ── STEP 2: Build DB context for campus questions ─────────────────────
        String dbContext = null;
        if (isCampusQuestion) {
            try {
                dbContext = DatabaseContextBuilder.build(
                        user, message,
                        attRepo, resultRepo, feeRepo, examRepo, courseRepo, schedRepo, userRepo);
            } catch (Exception e) {
                log.warn("DB context error: {}", e.getMessage());
            }
        }

        // ── STEP 3: Built-in engine FIRST (always works, no external deps) ────
        String response;
        try {
            response = ResponseBuilder.build(
                    user, message, dbContext,
                    attRepo, resultRepo, feeRepo, examRepo, courseRepo, schedRepo, userRepo);
        } catch (Exception e) {
            log.error("ResponseBuilder error: {}", e.getMessage(), e);
            response = ResponseBuilder.fallback(user);
        }

        // ── STEP 4: Try Ollama to enhance the answer (optional, non-blocking) ─
        boolean ollamaUsed = false;
        try {
            if (ollamaService != null && ollamaService.isAvailableFast()) {
                String prompt = buildSystemPrompt(user, message, dbContext);
                String ollamaReply = ollamaService.askAI(prompt);
                if (ollamaReply != null && !ollamaReply.isBlank()) {
                    response = ollamaReply;
                    ollamaUsed = true;
                    log.info("[Ollama] Enhanced response for user={}", user.getUsername());
                }
            }
        } catch (Exception e) {
            log.warn("[Ollama] Skipped — {}", e.getMessage());
            // keep the built-in response
        }

        // ── STEP 5: Wrap and return ───────────────────────────────────────────
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("response",    response);
        out.put("suggestions", roleSuggestions(user.getRole()));
        out.put("timestamp",   LocalDateTime.now().toString());
        out.put("user",        user.getName());
        out.put("role",        user.getRole().name());
        out.put("aiPowered",   ollamaUsed);
        return out;
    }

    /** Backward-compat overload used nowhere else — delegates cleanly */
    
    // ═════════════════════════════════════════════════════════════════════════
    //  SYSTEM PROMPT — injected into Ollama /api/generate as the full prompt
    // ═════════════════════════════════════════════════════════════════════════

    private String buildSystemPrompt(User user, String userMessage, String dbContext) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));

        return  "You are CampusMate AI, the intelligent assistant for the CampusIQ platform.\n"
              + "You assist three types of users:\n"
              + "1. Student\n"
              + "2. Faculty\n"
              + "3. Administrator\n"
              + "Your job is to answer questions using campus data when available "
              + "and general knowledge when needed.\n\n"

              + "USER INFORMATION\n"
              + "----------------\n"
              + "User Name: " + user.getName()            + "\n"
              + "User Role: " + user.getRole().name()     + "\n"
              + "Date: "      + today                     + "\n\n"

              + "DATABASE CONTEXT\n"
              + "----------------\n"
              + (dbContext != null && !dbContext.isBlank()
                    ? dbContext
                    : "Not required for this question. Answer using general knowledge.\n")
              + "\n"

              + "RULES\n"
              + "-----\n"
              + "1. If the question is about campus information (attendance, CGPA, results, "
              +    "exams, fees, profile), use ONLY the database context provided.\n"
              + "2. Never invent or guess campus data.\n"
              + "3. If the database context does not contain the requested data, "
              +    "politely say the data is unavailable.\n"
              + "4. For general knowledge questions (programming, science, career advice, "
              +    "history, etc.), answer using your knowledge.\n"
              + "5. Always respect user roles:\n"
              + "   - Students can see only their own data.\n"
              + "   - Faculty can see course-related data.\n"
              + "   - Admin can see system-wide information.\n"
              + "6. Do not expose private data of other users.\n"
              + "7. Give clear, short, friendly answers. Use **bold** for key numbers.\n"
              + "8. Use bullet points when listing items.\n\n"

              + "Now answer the following question directly and helpfully:\n"
              + "USER QUESTION: " + userMessage;
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  STEP 1 — INTENT DETECTOR
    //  Decides: is this a campus question (needs DB) or general question?
    // ═════════════════════════════════════════════════════════════════════════

    static class IntentDetector {

        private static final String[] CAMPUS_KEYWORDS = {
            // Attendance
            "attendance", "present", "absent", "bunk", "miss", "75%", "75 percent",
            "how many class", "classes needed", "shortage", "debarr",
            // Academics
            "cgpa", "sgpa", "gpa", "grade point", "result", "marks", "score",
            "grade", "pass", "fail", "mid", "end sem", "semester result",
            // Fees
            "fee", "payment", "pending", "due", "overdue", "outstanding", "pay",
            // Exams
            "exam", "test", "upcoming", "timetable", "next exam", "schedule",
            // Courses / Profile
            "course", "subject", "syllabus", "curriculum",
            "profile", "enrollment", "department", "my detail",
            // Contextual phrases
            "my ", "i have", "what is my", "show my", "check my",
            "how am i", "am i safe", "can i miss",
            // People (faculty/admin context)
            "student", "faculty", "at risk", "performance", "overview",
            // Tips (personalized = needs DB)
            "study tip", "improve my", "how to score", "suggestion for me"
        };

        /**
         * Returns true  → fetch DB context, inject into prompt
         * Returns false → skip DB, answer directly from OpenAI knowledge
         */
        public static boolean isCampusQuestion(String message) {
            String lower = message.toLowerCase();
            for (String kw : CAMPUS_KEYWORDS) {
                if (lower.contains(kw)) return true;
            }
            return false;
        }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  STEP 2 — DATABASE CONTEXT BUILDER
    //  Queries MySQL and formats the context text injected into {DATABASE_CONTEXT}
    // ═════════════════════════════════════════════════════════════════════════

    static class DatabaseContextBuilder {

        static String build(User user, String message,
                            AttendanceRepository      attRepo,
                            ResultRepository          resultRepo,
                            FeeRepository             feeRepo,
                            ExamRepository            examRepo,
                            CourseRepository          courseRepo,
                            FacultyScheduleRepository schedRepo,
                            UserRepository            userRepo) {
            try {
                return switch (user.getRole()) {
                    case STUDENT -> forStudent(user, message, attRepo, resultRepo, feeRepo, examRepo, courseRepo);
                    case FACULTY -> forFaculty(user, message, attRepo, resultRepo, examRepo, schedRepo, userRepo);
                    case ADMIN   -> forAdmin(message, attRepo, resultRepo, feeRepo, examRepo, userRepo);
                };
            } catch (Exception e) {
                return "Error loading campus data: " + e.getMessage();
            }
        }

        // ── Student DB context ────────────────────────────────────────────────
        private static String forStudent(User s, String msg,
                                          AttendanceRepository  attRepo,
                                          ResultRepository      resultRepo,
                                          FeeRepository         feeRepo,
                                          ExamRepository        examRepo,
                                          CourseRepository      courseRepo) {
            String q = msg.toLowerCase();
            StringBuilder ctx = new StringBuilder();

            // Profile block — always included
            ctx.append("=== STUDENT PROFILE ===\n");
            ctx.append("Name:       ").append(s.getName()).append("\n");
            ctx.append("Enrollment: ").append(nv(s.getEnrollmentNumber())).append("\n");
            ctx.append("Department: ").append(nv(s.getDepartment())).append("\n");
            ctx.append("Email:      ").append(nv(s.getEmail())).append("\n\n");

            // Attendance — always included (needed for 75% rule, tips, summary)
            buildAttendanceBlock(ctx, s, attRepo);

            // CGPA — always included
            Double cgpa = resultRepo.calculateCgpa(s.getId());
            ctx.append("=== CGPA ===\n");
            ctx.append(String.format("Cumulative GPA: %.2f / 10.0\n\n", cgpa != null ? cgpa : 0.0));

            // Results — when asked
            if (has(q, "result","marks","score","grade","pass","fail","mid","end sem"))
                buildResultsBlock(ctx, s, resultRepo);

            // Fees — when asked
            if (has(q, "fee","payment","pending","due","overdue","pay","amount","money"))
                buildFeesBlock(ctx, s, feeRepo);

            // Exams — when asked
            if (has(q, "exam","test","upcoming","timetable","when","next exam","schedule"))
                buildExamsBlock(ctx, examRepo);

            // Courses — when asked
            if (has(q, "course","subject","syllabus","curriculum"))
                buildCoursesBlock(ctx, courseRepo);

            // 75% calculator — always include when attendance-related
            if (has(q, "bunk","75","how many class","miss","shortage","can i","classes needed"))
                buildBunkCalcBlock(ctx, s, attRepo);

            return ctx.toString();
        }

        // ── Faculty DB context ────────────────────────────────────────────────
        private static String forFaculty(User f, String msg,
                                          AttendanceRepository      attRepo,
                                          ResultRepository          resultRepo,
                                          ExamRepository            examRepo,
                                          FacultyScheduleRepository schedRepo,
                                          UserRepository            userRepo) {
            String q = msg.toLowerCase();
            StringBuilder ctx = new StringBuilder();

            ctx.append("=== FACULTY PROFILE ===\n");
            ctx.append("Name:       ").append(f.getName()).append("\n");
            ctx.append("Department: ").append(nv(f.getDepartment())).append("\n");
            ctx.append("System:     Students=").append(userRepo.countByRole(Role.STUDENT))
               .append(" | Faculty=").append(userRepo.countByRole(Role.FACULTY)).append("\n\n");

            if (has(q, "risk","below 75","low attend","shortage","concern","debarr","who"))
                buildAtRiskBlock(ctx, userRepo, attRepo);

            if (has(q, "result","mark","grade","perform","cgpa","pass","fail","student","overview"))
                buildStudentPerfBlock(ctx, userRepo, resultRepo, attRepo);

            if (has(q, "schedule","topic","class","taught","today","week","my class"))
                buildFacultyScheduleBlock(ctx, f, schedRepo);

            if (has(q, "exam","upcoming","test","timetable"))
                buildExamsBlock(ctx, examRepo);

            return ctx.toString();
        }

        // ── Admin DB context ──────────────────────────────────────────────────
        private static String forAdmin(String msg,
                                        AttendanceRepository attRepo,
                                        ResultRepository     resultRepo,
                                        FeeRepository        feeRepo,
                                        ExamRepository       examRepo,
                                        UserRepository       userRepo) {
            String q = msg.toLowerCase();
            StringBuilder ctx = new StringBuilder();

            ctx.append("=== SYSTEM OVERVIEW ===\n");
            ctx.append("Total Students: ").append(userRepo.countByRole(Role.STUDENT)).append("\n");
            ctx.append("Total Faculty:  ").append(userRepo.countByRole(Role.FACULTY)).append("\n\n");

            if (has(q, "student","list","all","enroll","everyone"))
                buildAllStudentsBlock(ctx, userRepo, attRepo, resultRepo);

            if (has(q, "faculty","teacher","staff","professor"))
                buildAllFacultyBlock(ctx, userRepo);

            if (has(q, "fee","payment","revenue","outstanding","pending","money","collection"))
                buildFeesSummaryBlock(ctx, feeRepo);

            if (has(q, "risk","below 75","low attend","concern","shortage"))
                buildAtRiskBlock(ctx, userRepo, attRepo);

            if (has(q, "result","cgpa","grade","perform","mark","academic"))
                buildResultsSummaryBlock(ctx, userRepo, resultRepo);

            if (has(q, "exam","upcoming","test","timetable"))
                buildExamsBlock(ctx, examRepo);

            return ctx.toString();
        }

        // ── Block builders ────────────────────────────────────────────────────

        private static void buildAttendanceBlock(StringBuilder ctx, User student, AttendanceRepository attRepo) {
            List<Attendance> records = attRepo.findByStudentOrderByDateDesc(student);
            ctx.append("=== ATTENDANCE ===\n");
            if (records.isEmpty()) { ctx.append("No records yet.\n\n"); return; }

            Map<Long, long[]>  map   = new LinkedHashMap<>();
            Map<Long, String>  names = new LinkedHashMap<>();
            for (Attendance a : records) {
                Long cid = a.getCourse().getId();
                names.put(cid, a.getCourse().getCourseName() + " (" + a.getCourse().getCourseCode() + ")");
                map.computeIfAbsent(cid, k -> new long[]{0, 0});
                map.get(cid)[1]++;
                if (a.getStatus() == Attendance.AttendanceStatus.PRESENT
                 || a.getStatus() == Attendance.AttendanceStatus.LATE) map.get(cid)[0]++;
            }
            for (var e : map.entrySet()) {
                long p = e.getValue()[0], t = e.getValue()[1];
                double pct  = t > 0 ? p * 100.0 / t : 0;
                long   need = pct < 75 ? (long) Math.ceil((75.0 * t - 100.0 * p) / 25.0) : 0;
                long   safe = pct >= 75 ? (long) (p / 0.75 - t) : 0;
                ctx.append(String.format("%-42s: %d/%d = %.1f%% [%s]%s%s\n",
                    names.get(e.getKey()), p, t, pct,
                    pct >= 75 ? "SAFE" : "BELOW 75% - AT RISK",
                    need > 0 ? " | Must attend " + need + " more classes" : "",
                    safe > 0 ? " | Can miss "    + safe + " more classes"  : ""));
            }
            ctx.append("\n");
        }

        private static void buildBunkCalcBlock(StringBuilder ctx, User student, AttendanceRepository attRepo) {
            List<Attendance> records = attRepo.findByStudentOrderByDateDesc(student);
            if (records.isEmpty()) return;
            ctx.append("=== 75% BUNK CALCULATOR ===\n");
            Map<Long, long[]> map   = new LinkedHashMap<>();
            Map<Long, String> names = new LinkedHashMap<>();
            for (Attendance a : records) {
                Long cid = a.getCourse().getId();
                names.put(cid, a.getCourse().getCourseName());
                map.computeIfAbsent(cid, k -> new long[]{0, 0});
                map.get(cid)[1]++;
                if (a.getStatus() == Attendance.AttendanceStatus.PRESENT
                 || a.getStatus() == Attendance.AttendanceStatus.LATE) map.get(cid)[0]++;
            }
            for (var e : map.entrySet()) {
                long p = e.getValue()[0], t = e.getValue()[1];
                double pct = t > 0 ? p * 100.0 / t : 0;
                if (pct >= 75) {
                    long canMiss = (long) (p / 0.75 - t);
                    ctx.append(String.format("%s: %.1f%% → CAN MISS %d more class(es)\n",
                            names.get(e.getKey()), pct, canMiss));
                } else {
                    long need = (long) Math.ceil((75.0 * t - 100.0 * p) / 25.0);
                    ctx.append(String.format("%s: %.1f%% → MUST ATTEND %d consecutive class(es)\n",
                            names.get(e.getKey()), pct, need));
                }
            }
            ctx.append("\n");
        }

        private static void buildResultsBlock(StringBuilder ctx, User student, ResultRepository resultRepo) {
            List<Result> results = resultRepo.findByStudentId(student.getId());
            ctx.append("=== EXAM RESULTS ===\n");
            if (results.isEmpty()) { ctx.append("No results published yet.\n\n"); return; }
            for (Result r : results)
                ctx.append(String.format("[%-3s] %-30s: %s/%d | %.1f%% | Grade: %-2s | %s\n",
                    r.getResultType() != null ? r.getResultType() : "MID",
                    r.getExam().getCourse().getCourseName(),
                    r.getMarksObtained(), r.getExam().getTotalMarks(),
                    r.getPercentage() != null ? r.getPercentage().doubleValue() : 0.0,
                    r.getGrade() != null ? r.getGrade() : "N/A",
                    Boolean.TRUE.equals(r.getPass()) ? "PASSED" : "FAILED"));
            ctx.append("\n");
        }

        private static void buildFeesBlock(StringBuilder ctx, User student, FeeRepository feeRepo) {
            List<Fee> fees = feeRepo.findByStudentOrderByDueDateDesc(student);
            ctx.append("=== FEES ===\n");
            if (fees.isEmpty()) { ctx.append("No fee records.\n\n"); return; }
            double paid    = fees.stream().filter(f -> f.getStatus() == Fee.FeeStatus.PAID)
                                 .mapToDouble(f -> f.getAmount().doubleValue()).sum();
            double pending = fees.stream()
                                 .filter(f -> f.getStatus() != Fee.FeeStatus.PAID && f.getStatus() != Fee.FeeStatus.CANCELLED)
                                 .mapToDouble(f -> f.getAmount().doubleValue()).sum();
            ctx.append(String.format("Paid: Rs%.0f | Pending: Rs%.0f\n", paid, pending));
            for (Fee f : fees)
                ctx.append(String.format("  %-20s: Rs%-8.0f | %-10s | Due: %s\n",
                    f.getFeeType(), f.getAmount().doubleValue(), f.getStatus(), f.getDueDate()));
            ctx.append("\n");
        }

        private static void buildExamsBlock(StringBuilder ctx, ExamRepository examRepo) {
            List<Exam> exams = examRepo.findUpcoming(LocalDateTime.now());
            ctx.append("=== UPCOMING EXAMS ===\n");
            if (exams.isEmpty()) { ctx.append("No upcoming exams.\n\n"); return; }
            exams.stream().limit(6).forEach(e -> {
                long days = ChronoUnit.DAYS.between(LocalDate.now(), e.getScheduledDate().toLocalDate());
                ctx.append(String.format("  %-25s | %-20s | Type: %-7s | %s | %d days away | %d marks\n",
                    e.getExamName(), e.getCourse().getCourseName(),
                    e.getExamType() != null ? e.getExamType() : "N/A",
                    e.getScheduledDate().toLocalDate(), days, e.getTotalMarks()));
            });
            ctx.append("\n");
        }

        private static void buildCoursesBlock(StringBuilder ctx, CourseRepository courseRepo) {
            List<Course> courses = courseRepo.findAll();
            ctx.append("=== COURSES ===\n");
            if (courses.isEmpty()) { ctx.append("No courses found.\n\n"); return; }
            courses.forEach(c -> ctx.append(String.format("  %s — %s (%d credits)\n",
                c.getCourseCode(), c.getCourseName(),
                c.getCreditHours() != null ? c.getCreditHours() : 0)));
            ctx.append("\n");
        }

        private static void buildAtRiskBlock(StringBuilder ctx, UserRepository userRepo, AttendanceRepository attRepo) {
            ctx.append("=== AT-RISK STUDENTS (below 75%) ===\n");
            int count = 0;
            for (User s : userRepo.findByRole(Role.STUDENT)) {
                List<Attendance> att = attRepo.findByStudentOrderByDateDesc(s);
                if (att.isEmpty()) continue;
                long p = att.stream().filter(a ->
                    a.getStatus() == Attendance.AttendanceStatus.PRESENT ||
                    a.getStatus() == Attendance.AttendanceStatus.LATE).count();
                double pct = p * 100.0 / att.size();
                if (pct < 75) {
                    long need = (long) Math.ceil((75.0 * att.size() - 100.0 * p) / 25.0);
                    ctx.append(String.format("  %-25s | %-12s | %.1f%% | Must attend %d more\n",
                        s.getName(), nv(s.getEnrollmentNumber()), pct, need));
                    count++;
                }
            }
            if (count == 0) ctx.append("  None — all students above 75%!\n");
            ctx.append("\n");
        }

        private static void buildStudentPerfBlock(StringBuilder ctx,
                                                   UserRepository userRepo,
                                                   ResultRepository resultRepo,
                                                   AttendanceRepository attRepo) {
            ctx.append("=== STUDENT PERFORMANCE ===\n");
            for (User s : userRepo.findByRole(Role.STUDENT)) {
                Double cgpa = resultRepo.calculateCgpa(s.getId());
                long fails  = resultRepo.countFailedByStudent(s.getId());
                List<Attendance> att = attRepo.findByStudentOrderByDateDesc(s);
                long p = att.stream().filter(a ->
                    a.getStatus() == Attendance.AttendanceStatus.PRESENT ||
                    a.getStatus() == Attendance.AttendanceStatus.LATE).count();
                double pct = att.isEmpty() ? 0 : p * 100.0 / att.size();
                ctx.append(String.format("  %-25s | CGPA:%.2f | Att:%.1f%% | Failed:%d%s\n",
                    s.getName(), cgpa != null ? cgpa : 0.0, pct, fails,
                    pct < 75 ? " [AT RISK]" : ""));
            }
            ctx.append("\n");
        }

        private static void buildFacultyScheduleBlock(StringBuilder ctx, User faculty,
                                                       FacultyScheduleRepository schedRepo) {
            List<FacultySchedule> sch = schedRepo.findByFacultyId(faculty.getId());
            ctx.append("=== YOUR TEACHING SCHEDULE (last 15) ===\n");
            if (sch.isEmpty()) { ctx.append("No schedule recorded.\n\n"); return; }
            sch.stream().limit(15).forEach(s -> ctx.append(String.format(
                "  %s | %-10s | Topic: %s\n",
                s.getScheduleDate(), s.getCourse().getCourseCode(),
                s.getTopicCovered() != null ? s.getTopicCovered() : "N/A")));
            ctx.append("\n");
        }

        private static void buildAllStudentsBlock(StringBuilder ctx,
                                                   UserRepository userRepo,
                                                   AttendanceRepository attRepo,
                                                   ResultRepository resultRepo) {
            ctx.append("=== ALL STUDENTS ===\n");
            for (User s : userRepo.findByRole(Role.STUDENT)) {
                Double cgpa = resultRepo.calculateCgpa(s.getId());
                List<Attendance> att = attRepo.findByStudentOrderByDateDesc(s);
                long p = att.stream().filter(a ->
                    a.getStatus() == Attendance.AttendanceStatus.PRESENT ||
                    a.getStatus() == Attendance.AttendanceStatus.LATE).count();
                double pct = att.isEmpty() ? 0 : p * 100.0 / att.size();
                ctx.append(String.format("  %-25s | %-12s | %-15s | Att:%.1f%% | CGPA:%.2f\n",
                    s.getName(), nv(s.getEnrollmentNumber()), nv(s.getDepartment()),
                    pct, cgpa != null ? cgpa : 0.0));
            }
            ctx.append("\n");
        }

        private static void buildAllFacultyBlock(StringBuilder ctx, UserRepository userRepo) {
            ctx.append("=== ALL FACULTY ===\n");
            userRepo.findByRole(Role.FACULTY).forEach(f ->
                ctx.append(String.format("  %-25s | %-20s | %s\n",
                    f.getName(), nv(f.getDepartment()), nv(f.getEmail()))));
            ctx.append("\n");
        }

        private static void buildFeesSummaryBlock(StringBuilder ctx, FeeRepository feeRepo) {
            List<Fee> all  = feeRepo.findAll();
            long paid      = all.stream().filter(f -> f.getStatus() == Fee.FeeStatus.PAID).count();
            long pending   = all.stream().filter(f ->
                f.getStatus() == Fee.FeeStatus.PENDING || f.getStatus() == Fee.FeeStatus.OVERDUE).count();
            double paidAmt = all.stream().filter(f -> f.getStatus() == Fee.FeeStatus.PAID)
                                .mapToDouble(f -> f.getAmount().doubleValue()).sum();
            double pendAmt = all.stream().filter(f ->
                f.getStatus() != Fee.FeeStatus.PAID && f.getStatus() != Fee.FeeStatus.CANCELLED)
                                .mapToDouble(f -> f.getAmount().doubleValue()).sum();
            ctx.append("=== FEE SUMMARY ===\n");
            ctx.append(String.format("Records:%d | Paid:%d (Rs%.0f) | Pending/Overdue:%d (Rs%.0f outstanding)\n\n",
                all.size(), paid, paidAmt, pending, pendAmt));
        }

        private static void buildResultsSummaryBlock(StringBuilder ctx,
                                                      UserRepository userRepo,
                                                      ResultRepository resultRepo) {
            ctx.append("=== RESULTS SUMMARY ===\n");
            for (User s : userRepo.findByRole(Role.STUDENT)) {
                Double cgpa = resultRepo.calculateCgpa(s.getId());
                long total  = resultRepo.findByStudentId(s.getId()).size();
                long failed = resultRepo.countFailedByStudent(s.getId());
                if (total > 0)
                    ctx.append(String.format("  %-25s | CGPA:%.2f | Results:%d | Failed:%d\n",
                        s.getName(), cgpa != null ? cgpa : 0.0, total, failed));
            }
            ctx.append("\n");
        }

        private static boolean has(String msg, String... kws) {
            for (String k : kws) if (msg.contains(k)) return true;
            return false;
        }

        private static String nv(String v) { return v != null && !v.isBlank() ? v : "N/A"; }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  STEP 4 — RESPONSE BUILDER  (built-in engine, no OpenAI required)
    //  Activated when: OpenAI unavailable OR OpenAI call fails
    //  Reads the DB context string that was already built and generates
    //  a rich formatted answer — ALWAYS returns a real response.
    // ═════════════════════════════════════════════════════════════════════════

    static class ResponseBuilder {

        static String build(User user, String message, String dbContext,
                            AttendanceRepository      attRepo,
                            ResultRepository          resultRepo,
                            FeeRepository             feeRepo,
                            ExamRepository            examRepo,
                            CourseRepository          courseRepo,
                            FacultyScheduleRepository schedRepo,
                            UserRepository            userRepo) {
            String q = message.toLowerCase().trim();
            return switch (user.getRole()) {
                case STUDENT -> studentReply(user, q, attRepo, resultRepo, feeRepo, examRepo, courseRepo);
                case FACULTY -> facultyReply(user, q, attRepo, resultRepo, examRepo, schedRepo, userRepo);
                case ADMIN   -> adminReply(user, q, attRepo, resultRepo, feeRepo, examRepo, userRepo);
            };
        }

        static String fallback(User user) {
            return "👋 Hello **" + user.getName() + "**! I'm **CampusMate AI**.\n\n"
                + "Ask me anything about your campus data or any general topic.\n"
                + "Examples: *\"My attendance\"*, *\"My CGPA\"*, *\"What is polymorphism?\"*";
        }

        // ── Student ───────────────────────────────────────────────────────────
        private static String studentReply(User u, String q,
                                            AttendanceRepository  attRepo,
                                            ResultRepository      resultRepo,
                                            FeeRepository         feeRepo,
                                            ExamRepository        examRepo,
                                            CourseRepository      courseRepo) {
            if (has(q,"hello","hi ","hey","good morning","good evening","namaste")) return greet(u);
            if (has(q,"bunk","can i miss","how many class","classes needed","reach 75","75"))
                return bunkCalc(u, attRepo);
            if (has(q,"attend","present","absent","shortage")) return attendanceReport(u, attRepo);
            if (has(q,"cgpa","cumulative gpa","grade point average","overall grade")) return cgpaReport(u, resultRepo);
            if (has(q,"sgpa","semester gpa","this semester gpa")) return sgpaReport(u, resultRepo);
            if (has(q,"result","marks","score","grade","pass","fail","mid","end sem")) return resultsReport(u, resultRepo);
            if (has(q,"fee","payment","pending","due","overdue","pay","outstanding")) return feesReport(u, feeRepo);
            if (has(q,"exam","upcoming","test","timetable","next exam")) return examsReport(examRepo);
            if (has(q,"tip","study","advice","improve","prepare","suggest","how to score")) return studyTips(u, attRepo, resultRepo);
            if (has(q,"profile","my detail","my info","who am i")) return profileReport(u);
            if (has(q,"course","subject","syllabus","curriculum")) return coursesReport(courseRepo);
            if (has(q,"summary","overview","dashboard","how am i","my status")) return summary(u, attRepo, resultRepo, feeRepo, examRepo);
            // General CS / knowledge questions answered inline
            return generalKnowledge(q, u);
        }

        // ── Faculty ───────────────────────────────────────────────────────────
        private static String facultyReply(User u, String q,
                                            AttendanceRepository      attRepo,
                                            ResultRepository          resultRepo,
                                            ExamRepository            examRepo,
                                            FacultyScheduleRepository schedRepo,
                                            UserRepository            userRepo) {
            if (has(q,"hello","hi","hey")) return greet(u);
            if (has(q,"risk","below 75","shortage","concern","debarr","who is below","low attend"))
                return atRiskReport(userRepo, attRepo);
            if (has(q,"student","perform","result","mark","grade","cgpa","all student","overview"))
                return studentPerfReport(userRepo, resultRepo, attRepo);
            if (has(q,"schedule","topic","class","taught","today","week","my class"))
                return facultyScheduleReport(u, schedRepo);
            if (has(q,"exam","upcoming","test","timetable")) return examsReport(examRepo);
            // Default: show student performance for faculty
            return studentPerfReport(userRepo, resultRepo, attRepo);
        }

        // ── Admin ─────────────────────────────────────────────────────────────
        private static String adminReply(User u, String q,
                                          AttendanceRepository attRepo,
                                          ResultRepository     resultRepo,
                                          FeeRepository        feeRepo,
                                          ExamRepository       examRepo,
                                          UserRepository       userRepo) {
            if (has(q,"hello","hi","hey")) return greet(u);
            if (has(q,"risk","below 75","shortage","concern","low attend"))
                return atRiskReport(userRepo, attRepo);
            if (has(q,"fee","payment","revenue","outstanding","pending","money","collection"))
                return adminFeesReport(feeRepo);
            if (has(q,"student","all","list","how many student","total"))
                return adminStudentsReport(userRepo, attRepo, resultRepo);
            if (has(q,"result","cgpa","grade","perform","mark","academic"))
                return adminResultsReport(userRepo, resultRepo);
            if (has(q,"exam","upcoming","test","timetable")) return examsReport(examRepo);
            // Default: system overview for unrecognized admin queries
            return adminStudentsReport(userRepo, attRepo, resultRepo);
        }

        // ── Individual reply builders ─────────────────────────────────────────

        private static String greet(User u) {
            String icon = switch (u.getRole()) { case STUDENT->"🎓"; case FACULTY->"👨‍🏫"; case ADMIN->"🔑"; };
            String menu = switch (u.getRole()) {
                case STUDENT -> "- 📊 **Attendance** & 75% bunk calculator\n"
                    + "- 📈 **CGPA** & exam results\n"
                    + "- 💳 **Fee** status\n"
                    + "- 📅 **Upcoming exams**\n"
                    + "- 💡 **Personalized study tips**\n"
                    + "- 💻 **General questions** — programming, science, career";
                case FACULTY -> "- 🚨 Students at risk (below 75%)\n"
                    + "- 📚 Your teaching schedule\n"
                    + "- 📊 Student performance overview\n"
                    + "- 📅 Upcoming exams";
                case ADMIN   -> "- 👥 All students overview\n"
                    + "- 💳 Fee collection summary\n"
                    + "- 📊 Academic results\n"
                    + "- 🚨 At-risk students";
            };
            return icon + " **Hello " + u.getName() + "!** I'm **CampusMate AI**.\n\n"
                + "I fetch **live campus data** from the database for every answer.\n\n"
                + "**What I can help with:**\n" + menu + "\n\nJust type your question! 😊";
        }

        private static String attendanceReport(User s, AttendanceRepository attRepo) {
            List<Attendance> rec = attRepo.findByStudentOrderByDateDesc(s);
            if (rec.isEmpty()) return "📊 No attendance records yet. Faculty will mark them soon.";
            Map<Long, long[]> map = new LinkedHashMap<>();
            Map<Long, String> nm  = new LinkedHashMap<>();
            for (Attendance a : rec) {
                Long cid = a.getCourse().getId();
                nm.put(cid, a.getCourse().getCourseName() + " (" + a.getCourse().getCourseCode() + ")");
                map.computeIfAbsent(cid, k -> new long[]{0,0});
                map.get(cid)[1]++;
                if (a.getStatus() == Attendance.AttendanceStatus.PRESENT
                 || a.getStatus() == Attendance.AttendanceStatus.LATE) map.get(cid)[0]++;
            }
            StringBuilder sb = new StringBuilder("📊 **Your Attendance (Live):**\n\n");
            for (var e : map.entrySet()) {
                long p = e.getValue()[0], t = e.getValue()[1];
                double pct = t > 0 ? p*100.0/t : 0;
                String icon = pct>=90?"🟢":pct>=75?"🟡":"🔴";
                sb.append(String.format("%s **%s**: %d/%d = **%.1f%%**", icon, nm.get(e.getKey()), p, t, pct));
                if (pct < 75) {
                    long need = (long) Math.ceil((75.0*t - 100.0*p)/25.0);
                    sb.append(" ⚠️ Need **").append(need).append(" more classes** to reach 75%");
                } else {
                    long canMiss = (long)(p/0.75 - t);
                    if (canMiss > 0) sb.append(" ✅ Can miss **").append(canMiss).append("** more");
                }
                sb.append("\n");
            }
            return sb.toString();
        }

        private static String bunkCalc(User s, AttendanceRepository attRepo) {
            List<Attendance> rec = attRepo.findByStudentOrderByDateDesc(s);
            if (rec.isEmpty()) return "No attendance data yet.";
            Map<Long, long[]> map = new LinkedHashMap<>();
            Map<Long, String> nm  = new LinkedHashMap<>();
            for (Attendance a : rec) {
                Long cid = a.getCourse().getId();
                nm.put(cid, a.getCourse().getCourseName());
                map.computeIfAbsent(cid, k -> new long[]{0,0});
                map.get(cid)[1]++;
                if (a.getStatus() == Attendance.AttendanceStatus.PRESENT
                 || a.getStatus() == Attendance.AttendanceStatus.LATE) map.get(cid)[0]++;
            }
            StringBuilder sb = new StringBuilder("🎯 **75% Bunk Calculator:**\n\n"
                + "> The rule: You must maintain **≥ 75%** attendance to appear in exams.\n\n");
            for (var e : map.entrySet()) {
                long p = e.getValue()[0], t = e.getValue()[1];
                double pct = t > 0 ? p*100.0/t : 0;
                sb.append("**").append(nm.get(e.getKey())).append("** (current: ")
                  .append(String.format("%.1f%%", pct)).append("):\n");
                if (pct >= 75) {
                    long canMiss = (long)(p/0.75 - t);
                    sb.append("  ✅ You can miss **").append(canMiss).append("** more class(es) safely.\n");
                } else {
                    long need = (long) Math.ceil((75.0*t - 100.0*p)/25.0);
                    sb.append("  🔴 You must attend **").append(need).append("** consecutive class(es) to reach 75%.\n");
                }
            }
            return sb.toString();
        }

        private static String cgpaReport(User s, ResultRepository resultRepo) {
            Double cgpa = resultRepo.calculateCgpa(s.getId());
            List<Result> results = resultRepo.findByStudentId(s.getId());
            if (results.isEmpty()) return "📈 No results yet. CGPA will appear once marks are published.";
            double cg = cgpa != null ? cgpa : 0.0;
            String lvl = cg>=9?"🏆 Outstanding":cg>=8?"⭐ Excellent":cg>=7?"👍 Very Good":cg>=6?"📚 Good":"⚠️ Needs Improvement";
            StringBuilder sb = new StringBuilder(String.format("📈 **Your CGPA: %.2f / 10.0** — %s\n\n", cg, lvl));
            sb.append("**How CGPA is calculated:**\n");
            sb.append("- Each subject has a grade → mapped to grade points (O=10, A+=9, A=8…)\n");
            sb.append("- CGPA = Σ(grade points × credits) ÷ total credits\n\n");
            sb.append("**Subject breakdown:**\n");
            for (Result r : results)
                sb.append(String.format("- [%s] %s — Grade: **%s** (%.1f%%) | %s\n",
                    r.getResultType()!=null?r.getResultType():"MID",
                    r.getExam().getCourse().getCourseName(),
                    r.getGrade()!=null?r.getGrade():"N/A",
                    r.getPercentage()!=null?r.getPercentage().doubleValue():0.0,
                    Boolean.TRUE.equals(r.getPass())?"✅ Pass":"❌ Fail"));
            if (cg < 7.0) sb.append("\n💡 Score above 75% per exam to push CGPA above 8.0.");
            return sb.toString();
        }

        private static String sgpaReport(User s, ResultRepository resultRepo) {
            Double sgpa = resultRepo.calculateSgpa(s.getId(), 4);
            List<Result> results = resultRepo.findByStudentIdAndSemester(s.getId(), 4);
            if (results.isEmpty()) return "📊 No semester 4 results yet.";
            StringBuilder sb = new StringBuilder(String.format("📊 **Semester 4 SGPA: %.2f / 10.0**\n\n", sgpa!=null?sgpa:0.0));
            for (Result r : results)
                sb.append(String.format("- %s: %s/%d | Grade: **%s** | %s\n",
                    r.getExam().getCourse().getCourseName(), r.getMarksObtained(),
                    r.getExam().getTotalMarks(), r.getGrade(),
                    Boolean.TRUE.equals(r.getPass())?"✅":"❌"));
            return sb.toString();
        }

        private static String resultsReport(User s, ResultRepository resultRepo) {
            List<Result> results = resultRepo.findByStudentId(s.getId());
            Double cgpa = resultRepo.calculateCgpa(s.getId());
            if (results.isEmpty()) return "📋 No results published yet. You'll be notified by email.";
            StringBuilder sb = new StringBuilder(String.format("📋 **Your Results** | CGPA: **%.2f/10**\n\n", cgpa!=null?cgpa:0.0));
            Map<String, List<Result>> byType = results.stream()
                .collect(Collectors.groupingBy(r -> r.getResultType()!=null?r.getResultType():"MID"));
            for (var entry : byType.entrySet()) {
                sb.append(entry.getKey().equals("SEM")?"**📖 Semester Results:**\n":"**📝 Mid-Semester Results:**\n");
                for (Result r : entry.getValue())
                    sb.append(String.format("- %s — **%s/%d** | Grade: **%s** | %s\n",
                        r.getExam().getCourse().getCourseName(),
                        r.getMarksObtained(), r.getExam().getTotalMarks(),
                        r.getGrade()!=null?r.getGrade():"N/A",
                        Boolean.TRUE.equals(r.getPass())?"✅ Pass":"❌ Fail"));
                sb.append("\n");
            }
            long failed = results.stream().filter(r -> !Boolean.TRUE.equals(r.getPass())).count();
            if (failed > 0) sb.append("⚠️ **").append(failed).append(" subject(s) failed** — prioritise these!");
            return sb.toString();
        }

        private static String feesReport(User s, FeeRepository feeRepo) {
            List<Fee> fees = feeRepo.findByStudentOrderByDueDateDesc(s);
            if (fees.isEmpty()) return "💳 No fee records found.";
            double paid    = fees.stream().filter(f->f.getStatus()==Fee.FeeStatus.PAID).mapToDouble(f->f.getAmount().doubleValue()).sum();
            double pending = fees.stream().filter(f->f.getStatus()!=Fee.FeeStatus.PAID&&f.getStatus()!=Fee.FeeStatus.CANCELLED).mapToDouble(f->f.getAmount().doubleValue()).sum();
            StringBuilder sb = new StringBuilder(String.format("💳 **Your Fees** | Paid: ₹%.0f | **Pending: ₹%.0f**\n\n", paid, pending));
            for (Fee f : fees) {
                String icon = f.getStatus()==Fee.FeeStatus.PAID?"✅":f.getStatus()==Fee.FeeStatus.OVERDUE?"🔴":"⏳";
                sb.append(String.format("%s **%s**: ₹%.0f — %s (Due: %s)\n",
                    icon, f.getFeeType(), f.getAmount().doubleValue(), f.getStatus(), f.getDueDate()));
            }
            if (pending > 0) sb.append("\n💡 Pay via the **Fees** page to avoid late penalties.");
            return sb.toString();
        }

        private static String examsReport(ExamRepository examRepo) {
            List<Exam> exams = examRepo.findUpcoming(LocalDateTime.now());
            if (exams.isEmpty()) return "📅 No upcoming exams right now.";
            StringBuilder sb = new StringBuilder("📅 **Upcoming Exams:**\n\n");
            exams.stream().limit(6).forEach(e -> {
                long days = ChronoUnit.DAYS.between(LocalDate.now(), e.getScheduledDate().toLocalDate());
                sb.append(String.format("📌 **%s** [%s]\n- %s | %s | %d marks%s\n\n",
                    e.getExamName(), e.getExamType()!=null?e.getExamType():"EXAM",
                    e.getCourse().getCourseName(),
                    days==0?"**TODAY!**":days+" days away",
                    e.getTotalMarks(),
                    days==0?" 🔴":days<=3?" ⚠️":""));
            });
            return sb.toString();
        }

        private static String studyTips(User s, AttendanceRepository attRepo, ResultRepository resultRepo) {
            List<Attendance> att = attRepo.findByStudentOrderByDateDesc(s);
            Double cgpa = resultRepo.calculateCgpa(s.getId());
            long p = att.stream().filter(a->a.getStatus()==Attendance.AttendanceStatus.PRESENT||a.getStatus()==Attendance.AttendanceStatus.LATE).count();
            double pct = att.isEmpty()?0:p*100.0/att.size();
            double cg  = cgpa!=null?cgpa:0.0;
            StringBuilder sb = new StringBuilder("💡 **Personalized Tips for " + s.getName() + ":**\n\n");
            if (pct<75) sb.append("🔴 **URGENT:** Attendance **").append(String.format("%.1f%%",pct)).append("** — attend every class this week!\n\n");
            if (cg<5.0) sb.append("🚨 CGPA **").append(String.format("%.2f",cg)).append("** is critical. Meet your faculty for help.\n\n");
            else if (cg>=8.5&&pct>=85) sb.append("🌟 Excellent! Consider research projects or internship applications.\n\n");
            else if (cg>=7.0) sb.append("👍 Good standing. Push CGPA above 8 by focusing on weak subjects.\n\n");
            sb.append("**Study Strategies:**\n");
            sb.append("- Use **Pomodoro** — 45 min study, 10 min break\n");
            sb.append("- Review notes **within 24 hours** of class\n");
            sb.append("- Solve **past 5 years' papers** before exams\n");
            sb.append("- **Teach topics** to peers — fastest way to learn\n");
            sb.append("- Sleep **7–8 hours** — memory consolidates during sleep\n");
            return sb.toString();
        }

        private static String profileReport(User u) {
            return String.format("👤 **Your Profile:**\n\n- Name: **%s**\n- Username: **%s**\n- Email: **%s**\n- Enrollment: **%s**\n- Department: **%s**\n- Phone: **%s**",
                u.getName(), u.getUsername(), u.getEmail(),
                nv(u.getEnrollmentNumber()), nv(u.getDepartment()), nv(u.getPhoneNumber()));
        }

        private static String coursesReport(CourseRepository courseRepo) {
            List<Course> c = courseRepo.findAll();
            if (c.isEmpty()) return "📚 No courses found.";
            StringBuilder sb = new StringBuilder("📚 **Courses:**\n\n");
            c.forEach(cr -> sb.append(String.format("- **%s** — %s (%d credits)\n",
                cr.getCourseCode(), cr.getCourseName(), cr.getCreditHours()!=null?cr.getCreditHours():0)));
            return sb.toString();
        }

        private static String summary(User s,
                                       AttendanceRepository attRepo, ResultRepository resultRepo,
                                       FeeRepository feeRepo, ExamRepository examRepo) {
            List<Attendance> att = attRepo.findByStudentOrderByDateDesc(s);
            Double cgpa = resultRepo.calculateCgpa(s.getId());
            List<Result> results = resultRepo.findByStudentId(s.getId());
            List<Fee> fees  = feeRepo.findByStudentOrderByDueDateDesc(s);
            int examCnt = examRepo.findUpcoming(LocalDateTime.now()).size();
            long p = att.stream().filter(a->a.getStatus()==Attendance.AttendanceStatus.PRESENT||a.getStatus()==Attendance.AttendanceStatus.LATE).count();
            double pct = att.isEmpty()?0:p*100.0/att.size();
            double pending = fees.stream().filter(f->f.getStatus()!=Fee.FeeStatus.PAID).mapToDouble(f->f.getAmount().doubleValue()).sum();
            long failed = results.stream().filter(r->!Boolean.TRUE.equals(r.getPass())).count();
            return String.format("📊 **Dashboard — %s**\n\n- 📅 Attendance: **%.1f%%** %s\n- 📈 CGPA: **%.2f/10**\n- 📋 Results: **%d** (%d failed)\n- 💳 Pending: **₹%.0f** %s\n- 📅 Exams: **%d upcoming**\n\nAsk me anything!",
                s.getName(), pct, pct<75?"⚠️ Below 75%!":"✅",
                cgpa!=null?cgpa:0.0, results.size(), failed,
                pending, pending>0?"⚠️":"✅", examCnt);
        }

        private static String atRiskReport(UserRepository userRepo, AttendanceRepository attRepo) {
            List<String> list = new ArrayList<>();
            for (User s : userRepo.findByRole(Role.STUDENT)) {
                List<Attendance> att = attRepo.findByStudentOrderByDateDesc(s);
                if (att.isEmpty()) continue;
                long p = att.stream().filter(a->a.getStatus()==Attendance.AttendanceStatus.PRESENT||a.getStatus()==Attendance.AttendanceStatus.LATE).count();
                double pct = p*100.0/att.size();
                if (pct < 75) {
                    long need = (long) Math.ceil((75.0*att.size()-100.0*p)/25.0);
                    list.add(String.format("- **%s** (%s) — **%.1f%%** | Needs %d more classes",
                        s.getName(), nv(s.getEnrollmentNumber()), pct, need));
                }
            }
            if (list.isEmpty()) return "✅ All students are above 75% attendance!";
            return "🚨 **" + list.size() + " student(s) at risk:**\n\n" + String.join("\n", list);
        }

        private static String studentPerfReport(UserRepository userRepo,
                                                  ResultRepository resultRepo,
                                                  AttendanceRepository attRepo) {
            StringBuilder sb = new StringBuilder("📊 **Student Performance:**\n\n");
            boolean any = false;
            for (User s : userRepo.findByRole(Role.STUDENT)) {
                Double cgpa = resultRepo.calculateCgpa(s.getId());
                long fails  = resultRepo.countFailedByStudent(s.getId());
                List<Attendance> att = attRepo.findByStudentOrderByDateDesc(s);
                long p = att.stream().filter(a->a.getStatus()==Attendance.AttendanceStatus.PRESENT||a.getStatus()==Attendance.AttendanceStatus.LATE).count();
                double pct = att.isEmpty()?0:p*100.0/att.size();
                if (cgpa!=null&&cgpa>0) { sb.append(String.format("- **%s**: CGPA=%.2f | Att=%.1f%% | Failed=%d%s\n", s.getName(), cgpa, pct, fails, pct<75?" ⚠️":"")); any=true; }
            }
            return any?sb.toString():"No results published yet.";
        }

        private static String facultyScheduleReport(User f, FacultyScheduleRepository schedRepo) {
            List<FacultySchedule> sch = schedRepo.findByFacultyId(f.getId());
            if (sch.isEmpty()) return "📚 No teaching schedule recorded.";
            StringBuilder sb = new StringBuilder("📚 **Your Teaching Schedule (last 10):**\n\n");
            sch.stream().limit(10).forEach(s -> sb.append(String.format("- **%s** | %s: %s\n",
                s.getScheduleDate(), s.getCourse().getCourseCode(),
                s.getTopicCovered()!=null?s.getTopicCovered():"N/A")));
            return sb.toString();
        }

        private static String adminFeesReport(FeeRepository feeRepo) {
            List<Fee> all = feeRepo.findAll();
            long paid  = all.stream().filter(f->f.getStatus()==Fee.FeeStatus.PAID).count();
            long pend  = all.stream().filter(f->f.getStatus()==Fee.FeeStatus.PENDING||f.getStatus()==Fee.FeeStatus.OVERDUE).count();
            double paidAmt = all.stream().filter(f->f.getStatus()==Fee.FeeStatus.PAID).mapToDouble(f->f.getAmount().doubleValue()).sum();
            double pendAmt = all.stream().filter(f->f.getStatus()!=Fee.FeeStatus.PAID&&f.getStatus()!=Fee.FeeStatus.CANCELLED).mapToDouble(f->f.getAmount().doubleValue()).sum();
            return String.format("💳 **Fee Summary:**\n\n- Records: **%d**\n- ✅ Paid: **%d** (₹%.0f)\n- ⏳ Pending/Overdue: **%d** (₹%.0f outstanding)",
                all.size(), paid, paidAmt, pend, pendAmt);
        }

        private static String adminStudentsReport(UserRepository userRepo,
                                                   AttendanceRepository attRepo,
                                                   ResultRepository resultRepo) {
            long ts = userRepo.countByRole(Role.STUDENT), tf = userRepo.countByRole(Role.FACULTY);
            StringBuilder sb = new StringBuilder(String.format("👥 **System: %d students | %d faculty**\n\n", ts, tf));
            for (User s : userRepo.findByRole(Role.STUDENT)) {
                Double cgpa = resultRepo.calculateCgpa(s.getId());
                List<Attendance> att = attRepo.findByStudentOrderByDateDesc(s);
                long p = att.stream().filter(a->a.getStatus()==Attendance.AttendanceStatus.PRESENT||a.getStatus()==Attendance.AttendanceStatus.LATE).count();
                double pct = att.isEmpty()?0:p*100.0/att.size();
                sb.append(String.format("- **%s** | %s | Att: %.1f%% | CGPA: %.2f%s\n",
                    s.getName(), nv(s.getDepartment()), pct, cgpa!=null?cgpa:0.0, pct<75?" ⚠️":""));
            }
            return sb.toString();
        }

        private static String adminResultsReport(UserRepository userRepo, ResultRepository resultRepo) {
            StringBuilder sb = new StringBuilder("📊 **Academic Summary:**\n\n");
            boolean any = false;
            for (User s : userRepo.findByRole(Role.STUDENT)) {
                Double cgpa = resultRepo.calculateCgpa(s.getId());
                List<Result> results = resultRepo.findByStudentId(s.getId());
                long failed = results.stream().filter(r->!Boolean.TRUE.equals(r.getPass())).count();
                if (!results.isEmpty()) { sb.append(String.format("- **%s**: CGPA=%.2f | Results=%d | Failed=%d\n", s.getName(), cgpa!=null?cgpa:0.0, results.size(), failed)); any=true; }
            }
            return any?sb.toString():"No results published yet.";
        }

        // ── Built-in general knowledge ────────────────────────────────────────
        private static String generalKnowledge(String q, User u) {
            if (has(q,"polymorphism","oop","inheritance","encapsulation","abstraction"))
                return "💻 **OOP — 4 Pillars:**\n\n"
                    + "- **Encapsulation** — bundle data + methods; hide internals\n"
                    + "- **Inheritance** — child class reuses parent (`extends`)\n"
                    + "- **Polymorphism** — same method name, different behaviour\n"
                    + "- **Abstraction** — expose only what's necessary (`interface` / `abstract`)";
            if (has(q,"what is cgpa","explain cgpa","how cgpa","calculate cgpa"))
                return "📈 **CGPA Explained:**\n\n"
                    + "CGPA = Σ(grade points × subject credits) ÷ total credits\n\n"
                    + "| Grade | Points |\n|-------|--------|\n"
                    + "| O | 10 |\n| A+ | 9 |\n| A | 8 |\n| B+ | 7 |\n| B | 6 |\n\n"
                    + "Maximum CGPA is **10.0**. Above **8.0** is considered excellent.";
            if (has(q,"75 rule","75% rule","attendance rule","why 75"))
                return "📊 **The 75% Attendance Rule:**\n\n"
                    + "- Minimum **75% attendance** per subject is mandatory.\n"
                    + "- Below 75% → you may be **debarred** from exams.\n"
                    + "- Formula: `(classes attended ÷ total classes) × 100 ≥ 75`";
            if (has(q,"java","spring","python","sql","html","algorithm","data structure","git","docker","api","rest"))
                return "💻 Great tech question!\n\nAsk me the specific concept and I'll explain it.\n"
                    + "Examples: *\"What is polymorphism?\"*, *\"What is a JOIN in SQL?\"*, *\"Explain REST API\"*";
            // Default
            return "🤔 **Hi " + u.getName() + "!** I want to help!\n\n"
                + "For **campus data**: attendance, CGPA, results, fees, exams.\n"
                + "For **general topics**: programming, career advice, study techniques.\n\n"
                + "Try rephrasing your question! 😊";
        }

        private static boolean has(String msg, String... kws) {
            for (String k : kws) if (msg.contains(k)) return true; return false;
        }
        private static String nv(String v) { return v!=null&&!v.isBlank()?v:"N/A"; }
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  ROLE-BASED FOLLOW-UP SUGGESTIONS
    // ═════════════════════════════════════════════════════════════════════════

    private List<String> roleSuggestions(Role role) {
        return switch (role) {
            case STUDENT -> List.of(
                "Check my attendance",
                "How many classes can I bunk?",
                "Show my CGPA",
                "My exam results",
                "Fee status",
                "Upcoming exams",
                "Study tips for me"
            );
            case FACULTY -> List.of(
                "Which students are at risk?",
                "My teaching schedule",
                "Student performance overview",
                "Upcoming exams"
            );
            case ADMIN -> List.of(
                "System overview",
                "Students at risk",
                "Fee collection summary",
                "Academic results summary",
                "Upcoming exams"
            );
        };
    }

    // ═════════════════════════════════════════════════════════════════════════
    //  UTILITIES
    // ═════════════════════════════════════════════════════════════════════════


}
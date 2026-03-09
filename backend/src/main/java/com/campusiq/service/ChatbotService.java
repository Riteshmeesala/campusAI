package com.campusiq.service;

import com.campusiq.entity.*;
import com.campusiq.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * CampusMate AI — ChatbotService (used by ChatbotController → POST /chatbot/chat)
 *
 * ROOT CAUSE FIXES:
 *  1. feeRepository.findTotalPendingAmountByStudent() was causing WARN (wrong return type)
 *     → replaced with sumPendingByStudent() which has correct @Query
 *  2. OpenAI 401/network failure → smartFallback() was returning "I could not retrieve"
 *     → replaced with full built-in engine that ALWAYS answers
 *  3. examRepository.findExamsInDateRange() had no @Query → replaced with findUpcoming()
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ChatbotService {

    private final AttendanceRepository attendanceRepository;
    private final ResultRepository     resultRepository;
    private final ExamRepository       examRepository;
    private final FeeRepository        feeRepository;
    private final UserRepository       userRepository;

    // ── Ollama local AI (replaces all OpenAI fields) ────────────────────────
    private final OllamaService ollamaService;

    // ─────────────────────────────────────────────────────────────────────
    //  ENTRY POINT  (called by ChatbotController)
    //  Returns: Map.of("reply", text, "user", name)
    // ─────────────────────────────────────────────────────────────────────
    public String chat(String userMessage, String userName, Long userId,
                       List<Map<String, String>> history) {

        if (userMessage == null || userMessage.isBlank()) {
            return "Hello " + firstName(userName) + "! Ask me anything about your campus data or any general topic 😊";
        }

        // Build live DB context (safe — never throws outward)
        String dbContext = buildDbContext(userId);

        // ── Try Ollama local AI ─────────────────────────────────────────────────
        try {
            String prompt = buildOllamaPrompt(userMessage, userName, dbContext);
            String reply  = ollamaService.askAI(prompt);
            if (reply != null && !reply.isBlank()) {
                log.info("[Ollama] Response OK for user={}", userName);
                return reply;
            }
            log.info("[Ollama] Unavailable or empty — using built-in engine for user={}", userName);
        } catch (Exception e) {
            log.warn("[Ollama] Unexpected error for user={}: {}", userName, e.getMessage());
        }

        // Built-in engine — ALWAYS returns a real answer, never "could not retrieve"
        return builtInAnswer(userMessage, userId, userName);
    }

    // Backward-compat overloads
    public String chat(String msg, String name) { return chat(msg, name, null, null); }
    public String chat(String msg, String name, Long userId) { return chat(msg, name, userId, null); }


    // ─────────────────────────────────────────────────────────────────────
    //  OLLAMA PROMPT BUILDER
    //  Constructs the single prompt string sent to Ollama /api/generate.
    //  Embeds live DB context + user info + rules in one text block.
    // ─────────────────────────────────────────────────────────────────────
    private String buildOllamaPrompt(String userMessage, String userName, String dbContext) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy"));
        return  "You are CampusMate AI, the intelligent assistant for the CampusIQ+ campus platform.\n"
              + "You assist students, faculty, and administrators.\n\n"
              + "USER INFORMATION\n"
              + "----------------\n"
              + "Name : " + userName + "\n"
              + "Date : " + today    + "\n\n"
              + "DATABASE CONTEXT (live MySQL data)\n"
              + "----------------------------------\n"
              + (dbContext != null && !dbContext.isBlank()
                    ? dbContext
                    : "No campus data context required — answer from general knowledge.\n")
              + "\n"
              + "RULES\n"
              + "-----\n"
              + "1. For campus questions (attendance, CGPA, fees, exams) use ONLY the database context above.\n"
              + "2. Never invent campus data. If context is empty say the data is unavailable.\n"
              + "3. For general questions (programming, science, career) use your training knowledge.\n"
              + "4. Keep answers concise, friendly, and well-formatted. Use bullet points where helpful.\n"
              + "5. Never expose private data of other users.\n\n"
              + "USER QUESTION:\n"
              + userMessage;
    }

    // ─────────────────────────────────────────────────────────────────────
    //  LIVE DB CONTEXT  (injected into Ollama prompt)
    // ─────────────────────────────────────────────────────────────────────
    private String buildDbContext(Long userId) {
        if (userId == null) return "No user ID — answer general questions only.";
        StringBuilder sb = new StringBuilder();

        // Profile
        try {
            userRepository.findById(userId).ifPresent(u ->
                sb.append("### PROFILE\nName:").append(u.getName())
                  .append(" | Dept:").append(nv(u.getDepartment()))
                  .append(" | Enroll:").append(nv(u.getEnrollmentNumber())).append("\n\n"));
        } catch (Exception e) { log.debug("ctx-profile: {}", e.getMessage()); }

        // Attendance — FIX: use findByStudentId (safe, always available)
        try {
            List<Attendance> list = attendanceRepository.findByStudentId(userId);
            long total   = list.size();
            long present = list.stream().filter(a ->
                    a.getStatus() == Attendance.AttendanceStatus.PRESENT
                 || a.getStatus() == Attendance.AttendanceStatus.LATE).count();
            double pct   = total > 0 ? present * 100.0 / total : 0;
            sb.append("### ATTENDANCE\n")
              .append(String.format("Overall: %d/%d = %.1f%% [%s]\n", present, total, pct,
                      pct >= 75 ? "SAFE" : "BELOW 75% - DANGER"));
            // Per-course
            Map<String, long[]> byCourse = new LinkedHashMap<>();
            list.forEach(a -> {
                String cn = a.getCourse() != null ? a.getCourse().getCourseName() : "Unknown";
                byCourse.computeIfAbsent(cn, k -> new long[2]);
                byCourse.get(cn)[1]++;
                if (a.getStatus() == Attendance.AttendanceStatus.PRESENT
                 || a.getStatus() == Attendance.AttendanceStatus.LATE) byCourse.get(cn)[0]++;
            });
            byCourse.forEach((c, v) -> {
                double cp = v[1] > 0 ? v[0] * 100.0 / v[1] : 0;
                long need = cp < 75 ? (long) Math.ceil((75.0 * v[1] - 100.0 * v[0]) / 25.0) : 0;
                sb.append(String.format("  %s: %d/%d=%.1f%%%s\n", c, v[0], v[1], cp,
                        need > 0 ? " [Need " + need + " more]" : ""));
            });
            sb.append("\n");
        } catch (Exception e) { log.debug("ctx-att: {}", e.getMessage()); }

        // Results + CGPA
        try {
            List<Result> results = resultRepository.findByStudentId(userId);
            Double cgpa = resultRepository.calculateCgpa(userId);
            sb.append(String.format("### RESULTS (CGPA: %.2f/10)\n", cgpa != null ? cgpa : 0.0));
            results.forEach(r -> sb.append(String.format(
                    "  [%s] %s: %s/%d | Grade:%s | %s\n",
                    r.getResultType() != null ? r.getResultType() : "MID",
                    r.getExam() != null ? r.getExam().getExamName() : "Exam",
                    r.getMarksObtained(),
                    r.getExam() != null && r.getExam().getTotalMarks() != null
                            ? r.getExam().getTotalMarks().intValue() : 100,
                    r.getGrade() != null ? r.getGrade() : "?",
                    Boolean.TRUE.equals(r.getPass()) ? "PASS" : "FAIL")));
            sb.append("\n");
        } catch (Exception e) { log.debug("ctx-results: {}", e.getMessage()); }

        // Fees — FIX: use sumPendingByStudent (has @Query, returns BigDecimal correctly)
        try {
            List<Fee> fees = feeRepository.findByStudentId(userId);
            BigDecimal pendAmt = feeRepository.sumPendingByStudent(userId);
            double pend = pendAmt != null ? pendAmt.doubleValue() : 0;
            sb.append(String.format("### FEES (pending: Rs%.0f)\n", pend));
            fees.forEach(f -> sb.append(String.format(
                    "  %s: Rs%.0f | %s | Due:%s\n",
                    f.getFeeType(), f.getAmount().doubleValue(), f.getStatus(), f.getDueDate())));
            sb.append("\n");
        } catch (Exception e) { log.debug("ctx-fees: {}", e.getMessage()); }

        // Exams — FIX: use findUpcoming() which has a working @Query
        try {
            List<Exam> upcoming = examRepository.findUpcoming(LocalDateTime.now());
            sb.append("### UPCOMING EXAMS\n");
            upcoming.stream().limit(5).forEach(e -> sb.append(String.format(
                    "  %s [%s] | %s | %s\n",
                    e.getExamName(), e.getExamType() != null ? e.getExamType() : "EXAM",
                    e.getCourse() != null ? e.getCourse().getCourseName() : "N/A",
                    e.getScheduledDate().toLocalDate())));
            sb.append("\n");
        } catch (Exception e) { log.debug("ctx-exams: {}", e.getMessage()); }

        return sb.length() > 30 ? sb.toString() : "No campus data yet.";
    }

    // ─────────────────────────────────────────────────────────────────────
    //  BUILT-IN ANSWER ENGINE  — runs when Ollama is unavailable or returns null
    //  ALWAYS returns a real, useful answer. Never "could not retrieve".
    // ─────────────────────────────────────────────────────────────────────
    private String builtInAnswer(String msg, Long userId, String userName) {
        String q     = msg.toLowerCase().trim();
        String first = firstName(userName);

        // ── Greetings ────────────────────────────────────────────
        if (has(q, "hello","hi","hey","hii","good morning","good afternoon","good evening","namaste","howdy","how are you","what's up","whats up"))
            return "👋 **Hello " + first + "!** I'm **CampusMate AI** — your real-time campus assistant.\n\n"
                + "I fetch **live data** from the database for every answer. I can help with:\n"
                + "• 📊 Attendance & 75% calculator\n• 📈 CGPA & results\n• 💳 Fees\n• 📅 Exams\n"
                + "• 💡 Study tips\n• 💻 CS/tech questions\n• 🌍 General knowledge\n\nJust ask! 😊";

        // ── Campus data ──────────────────────────────────────────
        if (has(q, "attend","present","absent","bunk","75%","shortage","classes needed","how many class"))
            return attendanceAnswer(userId);
        if (has(q, "cgpa","cumulative gpa","grade point average","my gpa","overall gpa"))
            return cgpaAnswer(userId);
        if (has(q, "result","marks","score","grade","pass","fail","my result","mid result","sem result"))
            return resultsAnswer(userId);
        if (has(q, "fee","payment","pending","due","overdue","pay","dues","outstanding"))
            return feeAnswer(userId);
        if (has(q, "exam","upcoming","test","timetable","next exam","when is exam","schedule"))
            return examAnswer();
        if (has(q, "summary","overview","how am i","dashboard","my status","everything"))
            return summaryAnswer(userId, first);
        if (has(q, "study","tips","advice","how to improve","how to score","prepare","revision"))
            return studyTips(userId, first);
        if (has(q, "profile","my detail","who am i","about me","my info"))
            return profileAnswer(userId);

        // ── CS & Programming ─────────────────────────────────────
        if (has(q, "java","python","spring","c++","javascript","html","css","react","node","programming",
                "oop","object oriented","class","object","interface","polymorphism","inheritance",
                "encapsulation","abstraction","constructor","method","overload","override",
                "data structure","array","linked list","stack","queue","tree","graph","heap",
                "sorting","algorithm","binary search","recursion","complexity","big o","time complexity",
                "sql","database","query","join","select","index","primary key","foreign key",
                "api","rest","http","json","xml","microservice","docker","git","github"))
            return csTopic(q);

        // ── Science ──────────────────────────────────────────────
        if (has(q, "photosynthesis","gravity","newton","atom","molecule","cell","dna","gene",
                "chromosome","force","energy","physics","chemistry","biology","periodic","element",
                "compound","reaction","osmosis","evolution","ecosystem","mitosis","meiosis"))
            return scienceTopic(q);

        // ── Math ─────────────────────────────────────────────────
        if (has(q, "calculate","formula","equation","derivative","integral","matrix","probability",
                "statistics","mean","median","mode","percentage","ratio","proportion","algebra",
                "trigonometry","logarithm","permutation","combination"))
            return mathTopic(q);

        // ── General Knowledge ─────────────────────────────────────
        if (has(q, "capital of","who invented","who discovered","india","president","prime minister",
                "world war","history","geography","largest","smallest","tallest","deepest","population",
                "when did","which country","which year"))
            return gkTopic(q);

        // ── Career ───────────────────────────────────────────────
        if (has(q, "placement","job","internship","resume","interview","career","salary","company",
                "software engineer","data scientist","how to get placed","package","lpa","ctc"))
            return "💼 **Career Tips for " + first + ":**\n\n"
                + "• Build strong **DSA skills** (LeetCode 100+ problems)\n"
                + "• Create **3–4 real projects** on GitHub with good README\n"
                + "• Apply on **LinkedIn, Naukri, Internshala** — start 3 months early\n"
                + "• Prepare **STAR method** for HR interviews\n"
                + "• CGPA **7.0+** is the cutoff for most IT companies\n"
                + "• Core subjects: DBMS, OS, CN, OOP — revise them well\n"
                + "• **Mock interviews** with peers — practice out loud\n\n"
                + "💡 Your CampusIQ CGPA will be on your resume. Keep it above 7!";

        // ── Motivation ───────────────────────────────────────────
        if (has(q, "motivat","sad","discouraged","give up","hopeless","depressed","stressed","worried","failing","i can't"))
            return "💪 **Don't give up, " + first + "!**\n\n"
                + "\"Success is not final, failure is not fatal — the courage to continue is what counts.\"\n\n"
                + "Every great student has faced setbacks. What matters is getting back up.\n\n"
                + "**Right now:** Take a 10-minute break, breathe deeply, then tackle one small task.\n"
                + "Talk to a friend, family member, or campus counsellor — you don't have to face it alone.\n\n"
                + "I believe in you! Ask me anything 😊";

        // ── Date ─────────────────────────────────────────────────
        if (has(q, "what date","today","what day","current date","what year","what month"))
            return "📅 Today is **" + LocalDate.now().getDayOfWeek() + ", "
                + LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy")) + "**";

        // ── CampusIQ features help ────────────────────────────────
        if (has(q, "how to","how do i","feature","publish result","mark attendance","add exam","pay fee","campusiq"))
            return platformHelp(q);

        // ── Joke ─────────────────────────────────────────────────
        if (has(q, "joke","funny","laugh","humor","make me smile"))
            return "😄 Why do Java programmers wear glasses?\n*Because they don't C#!* 👓\n\n"
                + "Why did the student eat his homework?\n*Because the teacher said it was a piece of cake!* 🎂";

        // ── Default — always helpful ──────────────────────────────
        return "🤔 **Hi " + first + "!** I want to help!\n\n"
            + "**📊 Your Campus Data (live DB):**\n"
            + "Try: *\"My attendance\"*, *\"My CGPA\"*, *\"Fee status\"*, *\"Upcoming exams\"*\n\n"
            + "**💻 Tech & Academics:**\n"
            + "Try: *\"Explain OOP\"*, *\"Java interview tips\"*, *\"Data structures\"*\n\n"
            + "**🌍 Anything else:**\n"
            + "Try: *\"Career advice\"*, *\"Study tips\"*, *\"India history\"*\n\n"
            + "Just rephrase your question and I'll answer! 😊";
    }

    // ─────────────────────────────────────────────────────────────────────
    //  CAMPUS ANSWER BUILDERS  (use live DB, with safe fallbacks)
    // ─────────────────────────────────────────────────────────────────────

    private String attendanceAnswer(Long userId) {
        if (userId == null) return "🔐 Please log in to check your attendance.";
        try {
            List<Attendance> list = attendanceRepository.findByStudentId(userId);
            if (list.isEmpty()) return "📊 No attendance records yet. Faculty will mark your attendance soon.";

            Map<String, long[]> byCourse = new LinkedHashMap<>();
            list.forEach(a -> {
                String key = a.getCourse() != null
                        ? a.getCourse().getCourseName() + " (" + a.getCourse().getCourseCode() + ")" : "Unknown";
                byCourse.computeIfAbsent(key, k -> new long[2]);
                byCourse.get(key)[1]++;
                if (a.getStatus() == Attendance.AttendanceStatus.PRESENT
                 || a.getStatus() == Attendance.AttendanceStatus.LATE) byCourse.get(key)[0]++;
            });

            long totalP = list.stream().filter(a ->
                    a.getStatus() == Attendance.AttendanceStatus.PRESENT
                 || a.getStatus() == Attendance.AttendanceStatus.LATE).count();
            double overall = totalP * 100.0 / list.size();

            StringBuilder sb = new StringBuilder(String.format(
                    "📊 **Overall Attendance: %.1f%%** %s\n\n",
                    overall, overall >= 75 ? "✅ Safe" : "🚨 BELOW 75% — DANGER!"));

            byCourse.forEach((course, v) -> {
                double cp = v[1] > 0 ? v[0] * 100.0 / v[1] : 0;
                String icon = cp >= 90 ? "🟢" : cp >= 75 ? "🟡" : "🔴";
                sb.append(String.format("%s **%s**: %d/%d = **%.1f%%**", icon, course, v[0], v[1], cp));
                if (cp < 75) {
                    long need = (long) Math.ceil((75.0 * v[1] - 100.0 * v[0]) / 25.0);
                    sb.append(" — Need **").append(need).append(" more classes** for 75%");
                } else {
                    long can = (long) (v[0] / 0.75 - v[1]);
                    if (can > 0) sb.append(" — Can miss ").append(can).append(" more");
                }
                sb.append("\n");
            });
            return sb.toString();
        } catch (Exception e) {
            log.error("attendanceAnswer error: {}", e.getMessage());
            return "⚠️ Could not load attendance right now. Please check the Attendance page directly.";
        }
    }

    private String cgpaAnswer(Long userId) {
        if (userId == null) return "🔐 Please log in to check your CGPA.";
        try {
            List<Result> results = resultRepository.findByStudentId(userId);
            if (results.isEmpty()) return "📈 No results yet. CGPA will show once faculty publishes your marks.";
            Double cgpa = resultRepository.calculateCgpa(userId);
            double cg   = cgpa != null ? cgpa : 0.0;
            String lvl  = cg >= 9 ? "🏆 Outstanding" : cg >= 8 ? "⭐ Excellent"
                        : cg >= 7 ? "👍 Very Good" : cg >= 6 ? "📚 Good" : "⚠️ Needs Improvement";
            StringBuilder sb = new StringBuilder(String.format("📈 **CGPA: %.2f/10** — %s\n\n", cg, lvl));
            results.forEach(r -> sb.append(String.format("• **%s** — %s/%d | Grade: **%s** | %s\n",
                    r.getExam() != null ? r.getExam().getExamName() : "Exam",
                    r.getMarksObtained(),
                    r.getExam() != null && r.getExam().getTotalMarks() != null
                            ? r.getExam().getTotalMarks().intValue() : 100,
                    r.getGrade() != null ? r.getGrade() : "?",
                    Boolean.TRUE.equals(r.getPass()) ? "✅ Pass" : "❌ Fail")));
            if (cg < 7) sb.append("\n💡 Score 75%+ per exam to push CGPA above 8.0");
            return sb.toString();
        } catch (Exception e) { return "📈 Could not load CGPA. Check the GPA Tracker page."; }
    }

    private String resultsAnswer(Long userId) {
        if (userId == null) return "🔐 Please log in to view your results.";
        try {
            List<Result> results = resultRepository.findByStudentId(userId);
            if (results.isEmpty()) return "📋 No results yet. You'll get notified when marks are published.";
            Double cgpa = resultRepository.calculateCgpa(userId);
            long failed = results.stream().filter(r -> !Boolean.TRUE.equals(r.getPass())).count();
            StringBuilder sb = new StringBuilder(String.format(
                    "📋 **Your Results** | CGPA: **%.2f/10**\n\n", cgpa != null ? cgpa : 0.0));
            results.forEach(r -> sb.append(String.format("• **%s** — %s/%d | Grade: **%s** | %s\n",
                    r.getExam() != null ? r.getExam().getExamName() : "Exam",
                    r.getMarksObtained(),
                    r.getExam() != null && r.getExam().getTotalMarks() != null
                            ? r.getExam().getTotalMarks().intValue() : 100,
                    r.getGrade() != null ? r.getGrade() : "?",
                    Boolean.TRUE.equals(r.getPass()) ? "✅ Pass" : "❌ Fail")));
            if (failed > 0) sb.append("\n⚠️ **").append(failed).append(" subject(s) failed** — focus on these!");
            return sb.toString();
        } catch (Exception e) { return "📋 Could not load results. Check the Results page directly."; }
    }

    private String feeAnswer(Long userId) {
        if (userId == null) return "🔐 Please log in to view your fees.";
        try {
            List<Fee> fees = feeRepository.findByStudentId(userId);
            if (fees.isEmpty()) return "💳 No fee records for your account.";
            // FIX: sumPendingByStudent has correct @Query — no more WARN in logs
            BigDecimal pendAmt = feeRepository.sumPendingByStudent(userId);
            double pend = pendAmt != null ? pendAmt.doubleValue() : 0;
            double paid = fees.stream().filter(f -> f.getStatus() == Fee.FeeStatus.PAID)
                              .mapToDouble(f -> f.getAmount().doubleValue()).sum();
            StringBuilder sb = new StringBuilder(String.format(
                    "💳 **Fees** | Paid: ₹%.0f | **Pending: ₹%.0f**\n\n", paid, pend));
            fees.forEach(f -> {
                String icon = f.getStatus() == Fee.FeeStatus.PAID ? "✅"
                            : f.getStatus() == Fee.FeeStatus.OVERDUE ? "🔴" : "⏳";
                sb.append(String.format("%s **%s**: ₹%.0f — %s (Due: %s)\n",
                        icon, f.getFeeType(), f.getAmount().doubleValue(),
                        f.getStatus(), f.getDueDate()));
            });
            if (pend > 0) sb.append("\n💡 Pay via the **Fees** page to avoid late penalties.");
            return sb.toString();
        } catch (Exception e) { return "💳 Could not load fee data. Check the Fees page directly."; }
    }

    private String examAnswer() {
        try {
            // FIX: use findUpcoming() — has a working @Query
            List<Exam> exams = examRepository.findUpcoming(LocalDateTime.now());
            if (exams.isEmpty()) return "📅 No upcoming exams right now. Check back later.";
            StringBuilder sb = new StringBuilder("📅 **Upcoming Exams:**\n\n");
            exams.stream().limit(7).forEach(e -> {
                long days = ChronoUnit.DAYS.between(LocalDate.now(),
                        e.getScheduledDate().toLocalDate());
                sb.append(String.format("📌 **%s** [%s]\n   %s | %s | Max: %d marks%s\n\n",
                        e.getExamName(),
                        e.getExamType() != null ? e.getExamType() : "EXAM",
                        e.getCourse() != null ? e.getCourse().getCourseName() : "N/A",
                        days > 0 ? days + " days away" : "**TODAY!**",
                        e.getTotalMarks(),
                        days == 0 ? " 🔴 TODAY!" : days <= 3 ? " ⚠️ Very soon!" : ""));
            });
            return sb.toString();
        } catch (Exception e) { return "📅 Could not load exams. Check the Exams page directly."; }
    }

    private String summaryAnswer(Long userId, String first) {
        if (userId == null) return "🔐 Please log in for your summary.";
        try {
            List<Attendance> att = attendanceRepository.findByStudentId(userId);
            long p = att.stream().filter(a ->
                    a.getStatus() == Attendance.AttendanceStatus.PRESENT
                 || a.getStatus() == Attendance.AttendanceStatus.LATE).count();
            double pct    = att.isEmpty() ? 0 : p * 100.0 / att.size();
            Double cgpa   = resultRepository.calculateCgpa(userId);
            double cg     = cgpa != null ? cgpa : 0.0;
            long results  = resultRepository.findByStudentId(userId).size();
            long failed   = resultRepository.findByStudentId(userId).stream()
                    .filter(r -> !Boolean.TRUE.equals(r.getPass())).count();
            BigDecimal pa = feeRepository.sumPendingByStudent(userId);
            double pend   = pa != null ? pa.doubleValue() : 0;
            int exams     = examRepository.findUpcoming(LocalDateTime.now()).size();

            return String.format("📊 **Summary for %s:**\n\n"
                    + "• 📅 Attendance: **%.1f%%** %s\n"
                    + "• 📈 CGPA: **%.2f/10** %s\n"
                    + "• 📋 Results: **%d** (%d failed)\n"
                    + "• 💳 Pending Fees: **₹%.0f** %s\n"
                    + "• 📅 Upcoming Exams: **%d**\n\n"
                    + "Ask me for full details on any topic! 😊",
                    first, pct, pct < 75 ? "⚠️ Below 75%!" : "✅",
                    cg, cg >= 8 ? "🏆" : cg < 6 ? "⚠️" : "📚",
                    results, failed, pend, pend > 0 ? "⚠️ Pay soon" : "✅", exams);
        } catch (Exception e) {
            return "📊 Could not load summary. Try asking about attendance or results separately.";
        }
    }

    private String studyTips(Long userId, String first) {
        StringBuilder sb = new StringBuilder("💡 **Study Tips for " + first + ":**\n\n");
        try {
            List<Attendance> att = attendanceRepository.findByStudentId(userId);
            long p = att.stream().filter(a ->
                    a.getStatus() == Attendance.AttendanceStatus.PRESENT
                 || a.getStatus() == Attendance.AttendanceStatus.LATE).count();
            double pct = att.isEmpty() ? 0 : p * 100.0 / att.size();
            Double cgpa = resultRepository.calculateCgpa(userId);
            double cg = cgpa != null ? cgpa : 0.0;
            if (pct < 75)
                sb.append("🔴 **URGENT:** Attendance is **").append(String.format("%.1f%%", pct))
                  .append("** — attend every class this week first!\n\n");
            if (cg < 5)
                sb.append("🚨 CGPA **").append(String.format("%.2f", cg))
                  .append("** is critical — visit faculty office hours daily.\n\n");
            else if (cg < 7.5)
                sb.append("📚 CGPA **").append(String.format("%.2f", cg))
                  .append("** — focus 2 extra hours/day on weak subjects.\n\n");
            else
                sb.append("🌟 Excellent CGPA **").append(String.format("%.2f", cg))
                  .append("**! Consider projects or internships.\n\n");
        } catch (Exception ignored) {}
        sb.append("**Proven Study Methods:**\n")
          .append("• **Pomodoro**: 45-min study + 10-min break cycles\n")
          .append("• Review notes **within 24 hours** of each class\n")
          .append("• Solve **5 years' past papers** before each exam\n")
          .append("• **Teach topics** to classmates — fastest way to learn\n")
          .append("• Sleep **7–8 hours** — memory consolidates during sleep\n")
          .append("• Start revision **2 weeks** before exams, not 2 days\n")
          .append("• Use **active recall** (flashcards) not passive re-reading\n");
        return sb.toString();
    }

    private String profileAnswer(Long userId) {
        if (userId == null) return "🔐 Please log in to view your profile.";
        try {
            return userRepository.findById(userId).map(u -> String.format(
                    "👤 **Your Profile:**\n\n• Name: **%s**\n• Username: **%s**\n• Email: **%s**\n• Enrollment: **%s**\n• Dept: **%s**\n• Phone: **%s**",
                    u.getName(), u.getUsername(), u.getEmail(),
                    nv(u.getEnrollmentNumber()), nv(u.getDepartment()), nv(u.getPhoneNumber())))
                    .orElse("Profile not found.");
        } catch (Exception e) { return "👤 Could not load profile. Check the My Profile page."; }
    }

    // ─────────────────────────────────────────────────────────────────────
    //  GENERAL KNOWLEDGE  (CS, Science, Math, GK, Career, Platform)
    // ─────────────────────────────────────────────────────────────────────

    private String csTopic(String q) {
        if (has(q, "oop","object oriented","polymorphism","inheritance","encapsulation","abstraction"))
            return "💻 **OOP (4 Pillars):**\n\n"
                + "• **Encapsulation** — bind data & methods in a class; hide internals\n"
                + "• **Inheritance** — child class inherits parent class properties (`extends`)\n"
                + "• **Polymorphism** — same method name, different behavior (override/overload)\n"
                + "• **Abstraction** — hide implementation, expose only what's needed (`interface`/`abstract class`)\n\n"
                + "These 4 pillars are the foundation of Java, Python, C++ and all OOP languages.";
        if (has(q, "data structure","array","linked list","stack","queue","tree","graph","heap"))
            return "📊 **Data Structures:**\n\n"
                + "• **Array** — fixed size, O(1) access, O(n) insert\n"
                + "• **LinkedList** — dynamic size, O(n) access, O(1) insert at head\n"
                + "• **Stack** — LIFO: push/pop O(1) | use: undo, recursion\n"
                + "• **Queue** — FIFO: enqueue/dequeue O(1) | use: BFS, task scheduling\n"
                + "• **Binary Tree (BST)** — O(log n) search, insert, delete\n"
                + "• **HashMap** — key-value pairs, O(1) average all operations\n\n"
                + "These are the most tested topics in coding interviews!";
        if (has(q, "algorithm","sorting","binary search","complexity","big o","time complexity","recursion"))
            return "⚡ **Algorithms & Complexity:**\n\n"
                + "• **Binary Search** — O(log n), requires sorted array\n"
                + "• **Bubble/Selection Sort** — O(n²), avoid in interviews\n"
                + "• **Merge Sort / Quick Sort** — O(n log n), preferred\n"
                + "• **BFS (Graph)** — O(V+E), level-by-level traversal\n"
                + "• **DFS (Graph)** — O(V+E), depth-first using stack/recursion\n\n"
                + "**Big-O** = worst-case growth rate. Always aim for O(n log n) or better.";
        if (has(q, "java","spring","springboot","jpa","hibernate","lombok"))
            return "☕ **Java / Spring Boot:**\n\n"
                + "• `@SpringBootApplication` — enables auto-config + component scan\n"
                + "• `@RestController` + `@RequestMapping` — REST API endpoints\n"
                + "• `@Service` — business logic layer\n"
                + "• `@Repository` — DB access via JPA (auto queries from method names)\n"
                + "• `@Transactional` — ensures atomic DB operations\n"
                + "• Lombok `@Data` — auto-generates getters, setters, toString\n\n"
                + "Your CampusIQ backend is built with Spring Boot + JPA! 🎓";
        if (has(q, "python"))
            return "🐍 **Python Quick Tips:**\n\n"
                + "• Indentation = code blocks (4 spaces, not tabs)\n"
                + "• List comprehension: `[x*2 for x in range(10)]`\n"
                + "• Key structures: `list`, `dict`, `tuple`, `set`\n"
                + "• `pip install <pkg>` for libraries\n"
                + "• Frameworks: **Django** (full-stack), **Flask** (lightweight), **FastAPI** (REST)\n"
                + "• #1 language for **Data Science, AI & ML** (NumPy, Pandas, TensorFlow)";
        if (has(q, "sql","database","query","select","join","index"))
            return "🗄️ **SQL Reference:**\n\n"
                + "• `SELECT col FROM table WHERE condition ORDER BY col LIMIT n`\n"
                + "• `INNER JOIN` — only matching rows in both tables\n"
                + "• `LEFT JOIN` — all from left + matching right (null if no match)\n"
                + "• `GROUP BY` + `HAVING` — aggregate with filter\n"
                + "• `INDEX` — speeds up queries 10–100x on large tables\n"
                + "• `PRIMARY KEY` — unique, non-null row ID\n"
                + "• `FOREIGN KEY` — enforces referential integrity\n\n"
                + "Your project uses MySQL with Spring JPA!";
        if (has(q, "react","javascript","html","css","frontend"))
            return "⚛️ **Frontend Development:**\n\n"
                + "• **HTML** — structure | **CSS** — styling | **JS** — logic\n"
                + "• **React** — component-based UI, `useState` / `useEffect` hooks\n"
                + "• `props` — data passed from parent | `state` — component's own data\n"
                + "• `useEffect(() => { fetchData() }, [])` — run on mount\n"
                + "• **Axios** — HTTP requests | **MUI** — Material-UI components\n\n"
                + "Your CampusIQ frontend uses React + Material UI!";
        if (has(q, "git","github","version control","commit","push","pull","branch","merge"))
            return "🔧 **Git Quick Reference:**\n\n"
                + "• `git init` — start a repo | `git clone <url>` — copy remote repo\n"
                + "• `git add .` — stage changes | `git commit -m 'msg'` — save snapshot\n"
                + "• `git push origin main` — upload to GitHub\n"
                + "• `git pull` — get latest changes | `git branch` — list branches\n"
                + "• `git checkout -b feature` — create & switch to new branch\n"
                + "• `git merge feature` — merge branch into current";
        return "💻 **CS/Programming Answer:**\n\n"
            + "Great tech question! For in-depth answers:\n"
            + "• **GeeksforGeeks** — algorithms & data structures\n"
            + "• **Baeldung** — Java/Spring Boot tutorials\n"
            + "• **MDN Web Docs** — HTML/CSS/JavaScript\n"
            + "• **Stack Overflow** — specific bugs and issues\n\n"
            + "Ask me something more specific — like *\"Explain polymorphism\"* or *\"What is a JOIN?\"* 😊";
    }

    private String scienceTopic(String q) {
        if (has(q, "photosynthesis"))
            return "🌱 **Photosynthesis:**\n\n"
                + "**6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂**\n\n"
                + "Plants convert sunlight, water & CO₂ into glucose and oxygen.\n"
                + "• Occurs in **chloroplasts**\n"
                + "• **Light reactions** in thylakoid membrane → ATP + NADPH\n"
                + "• **Calvin cycle** in stroma → glucose synthesis";
        if (has(q, "newton","gravity","force","mass","acceleration"))
            return "⚙️ **Newton's Laws of Motion:**\n\n"
                + "1. **Inertia** — object at rest stays at rest unless acted upon\n"
                + "2. **F = ma** — Force = mass × acceleration\n"
                + "3. **Action-Reaction** — every action has equal & opposite reaction\n\n"
                + "**Gravity**: F = Gm₁m₂/r² | g = 9.8 m/s² on Earth";
        if (has(q, "dna","gene","chromosome","cell","mitosis","meiosis"))
            return "🧬 **Biology:**\n\n"
                + "• **DNA** — double helix made of nucleotides (A, T, G, C)\n"
                + "• **Gene** — DNA segment coding for a specific protein\n"
                + "• **Chromosome** — packaged DNA (humans: 46 chromosomes / 23 pairs)\n"
                + "• **Cell** — basic unit of life; nucleus contains DNA\n"
                + "• **Mitosis** — cell division producing 2 identical daughter cells (growth)\n"
                + "• **Meiosis** — cell division producing 4 gametes (reproduction)";
        if (has(q, "atom","molecule","element","compound","periodic"))
            return "⚗️ **Chemistry:**\n\n"
                + "• **Atom** — smallest unit of matter (protons + neutrons + electrons)\n"
                + "• **Element** — pure substance with one atom type (e.g., O, Fe, Au)\n"
                + "• **Compound** — two+ elements chemically bonded (H₂O, NaCl, CO₂)\n"
                + "• **Periodic Table** — 118 elements, organized by atomic number\n"
                + "• **Covalent bond** — sharing electrons | **Ionic bond** — transfer of electrons";
        return "🔬 **Science Answer:**\n\n"
            + "For detailed science with diagrams:\n"
            + "• **Khan Academy** (free, excellent visual explanations)\n"
            + "• **NCERT textbooks** (for Indian curriculum)\n"
            + "• **YouTube** — search the topic + 'explained'\n\n"
            + "Ask me something specific like *\"Explain photosynthesis\"* or *\"Newton's laws\"*!";
    }

    private String mathTopic(String q) {
        return "🔢 **Math Quick Reference:**\n\n"
            + "• **Percentage**: (value/total) × 100\n"
            + "• **Compound Interest**: A = P(1 + r/n)^(nt)\n"
            + "• **Quadratic Formula**: x = (-b ± √(b²-4ac)) / 2a\n"
            + "• **Probability**: P(E) = favourable outcomes / total outcomes\n"
            + "• **Mean**: sum / count | **Median**: middle value | **Mode**: most frequent\n"
            + "• **Permutation**: nPr = n!/(n-r)! | **Combination**: nCr = n!/r!(n-r)!\n"
            + "• **Derivative** of xⁿ = nxⁿ⁻¹ | **Integral** of xⁿ = xⁿ⁺¹/(n+1) + C\n\n"
            + "Type a specific problem and I'll help solve it step by step! 😊";
    }

    private String gkTopic(String q) {
        if (has(q, "india","independence","republic"))
            return "🇮🇳 **India:**\n\n"
                + "• Independence: **August 15, 1947** from British rule\n"
                + "• First PM: **Jawaharlal Nehru** | First President: **Dr. Rajendra Prasad**\n"
                + "• Constitution: **January 26, 1950** (Republic Day)\n"
                + "• Capital: **New Delhi** | Currency: **Indian Rupee (₹)**\n"
                + "• World's largest democracy | Population: ~1.4 billion";
        if (has(q, "capital of"))
            return "🌍 **World Capitals:**\n\n"
                + "• India → **New Delhi** | USA → **Washington D.C.**\n"
                + "• UK → **London** | France → **Paris** | Germany → **Berlin**\n"
                + "• Japan → **Tokyo** | China → **Beijing** | Russia → **Moscow**\n"
                + "• Australia → **Canberra** | Canada → **Ottawa** | Brazil → **Brasília**";
        if (has(q, "who invented","who discovered"))
            return "🔭 **Famous Inventions:**\n\n"
                + "• **Telephone** — Alexander Graham Bell (1876)\n"
                + "• **Light bulb** — Thomas Edison (1879)\n"
                + "• **World Wide Web** — Tim Berners-Lee (1989)\n"
                + "• **Penicillin** — Alexander Fleming (1928)\n"
                + "• **Gravity** (law) — Isaac Newton (1687)\n"
                + "• **Computer** — Charles Babbage's Analytical Engine (1837)";
        if (has(q, "world war","ww1","ww2"))
            return "📚 **World Wars:**\n\n"
                + "• **WW1** (1914–1918): Triggered by assassination of Archduke Franz Ferdinand\n"
                + "• **WW2** (1939–1945): Germany invaded Poland; USA entered after Pearl Harbor\n"
                + "• WW2 ended with atomic bombs on Hiroshima (Aug 6) & Nagasaki (Aug 9), 1945\n"
                + "• Both wars reshaped world borders, politics, and technology permanently";
        return "🌍 **GK Answer:**\n\n"
            + "For detailed, verified GK:\n"
            + "• **Wikipedia** — comprehensive, reliable articles\n"
            + "• **NCERT books** — for Indian curriculum GK\n"
            + "• **Google** — for the most current facts\n\n"
            + "Ask a more specific question and I'll answer directly! 😊";
    }

    private String platformHelp(String q) {
        if (has(q, "publish result","add marks","enter marks","how to publish"))
            return "📋 **How to Publish Results:**\n\n**Faculty (Mid-Semester):**\n"
                + "1. Go to **Results** page\n2. Click **Publish Mid Results**\n"
                + "3. Select the exam\n4. Enter marks for each student\n"
                + "5. Click **Publish & Notify Students**\n\n**Admin (Semester-End):**\n"
                + "Same steps — use **Publish Sem Results** button.\n\n"
                + "Students get email + in-app notification instantly! 📧";
        if (has(q, "mark attendance","take attendance","how to mark"))
            return "📊 **How to Mark Attendance:**\n\n"
                + "1. Go to **Attendance** page\n2. Select **Course** and **Date**\n"
                + "3. Toggle each student: Present / Late / Absent\n"
                + "4. Click **Submit Attendance**\n\n"
                + "Students see their attendance within seconds! ✅";
        if (has(q, "pay fee","add fee","fee payment"))
            return "💳 **Fee Management:**\n\n**Admin** — add fee records:\n"
                + "1. Fees page → **Add Fee** → select student, type, amount, due date\n\n"
                + "**Students** — pay online:\n"
                + "1. Fees page → **Pay Now** → complete via **Razorpay**\n\nStatus updates automatically! ✅";
        if (has(q, "create exam","add exam","schedule exam","new exam"))
            return "📅 **How to Create an Exam:**\n\n"
                + "1. Go to **Exams** page\n2. Click **Create Exam**\n"
                + "3. Fill: name, course, date, total marks, passing marks, venue\n"
                + "4. Set type: **MIDSEM** or **ENDSEM**\n5. Click **Create**\n\n"
                + "Students see it on their dashboard immediately!";
        return "ℹ️ **CampusIQ+ Features:**\n\n"
            + "• 📊 Real-time attendance tracking\n"
            + "• 📋 Results (MID + SEM) with email notifications\n"
            + "• 💳 Fee management with Razorpay online payment\n"
            + "• 📅 Exam scheduling\n• 🤖 AI chatbot (that's me!)\n"
            + "• 📢 Announcements (email + in-app)\n\n"
            + "Ask me about any specific feature! 😊";
    }

    // ─────────────────────────────────────────────────────────────────────
    //  UTILITIES
    // ─────────────────────────────────────────────────────────────────────
    /** @deprecated replaced by Ollama — kept only if caller needs the flag */
    private boolean isAiAvailable() {
        return ollamaService.isAvailable();
    }

    private boolean has(String msg, String... keywords) {
        for (String kw : keywords) if (msg.contains(kw)) return true;
        return false;
    }

    private String firstName(String name) {
        if (name == null || name.isBlank()) return "there";
        return name.split(" ")[0];
    }

    private String nv(String v) {
        return (v != null && !v.isBlank()) ? v : "N/A";
    }
}
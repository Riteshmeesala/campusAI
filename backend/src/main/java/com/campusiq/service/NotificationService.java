package com.campusiq.service;

import com.campusiq.entity.Notification;
import com.campusiq.entity.Role;
import com.campusiq.entity.User;
import com.campusiq.repository.NotificationRepository;
import com.campusiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service @RequiredArgsConstructor @Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository         userRepository;
    private final JavaMailSender         mailSender;

    // ── Standard per-user notification methods ───────────────────────────────

    public List<Notification> getAll(Long userId, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(
            userId, PageRequest.of(page, size)).getContent();
    }

    public List<Notification> getUnread(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadByUser(userId);
    }

    // ── Create in-app notification for one user ───────────────────────────────
    @Transactional
    public Notification createNotification(User user, String title, String message,
                                            Notification.NotificationType type, Long refId) {
        return notificationRepository.save(Notification.builder()
            .user(user).title(title).message(message).type(type)
            .referenceId(refId).read(false).build());
    }

    // ── Send notification to ALL students when result published ──────────────
    @Transactional
    public void notifyAllStudentsResultPublished(String examName, String examType, Long examId) {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        String title   = examType.equalsIgnoreCase("MID")
            ? "📋 Mid-Term Result Published"
            : "📋 Semester Result Published";
        String message = String.format(
            "%s result for '%s' has been published. Check your Results page.",
            examType.equalsIgnoreCase("MID") ? "Mid-term" : "Semester-end", examName);
        Notification.NotificationType type = examType.equalsIgnoreCase("MID")
            ? Notification.NotificationType.MID_RESULT_PUBLISHED
            : Notification.NotificationType.SEM_RESULT_PUBLISHED;
        for (User student : students) {
            notificationRepository.save(Notification.builder()
                .user(student).title(title).message(message)
                .type(type).referenceId(examId).read(false).build());
        }
        // Also send emails async
        sendEmailsToStudents(students, title, message);
        log.info("Notified {} students about {} result: {}", students.size(), examType, examName);
    }

    // ── ✅ Broadcast email to ALL students (holidays, events, circulars) ──────
    @Transactional
    public int broadcastToStudents(String subject, String message,
                                    String targetRole, Notification.NotificationType type) {
        List<User> targets;
        if ("FACULTY".equalsIgnoreCase(targetRole)) {
            targets = userRepository.findByRole(Role.FACULTY);
        } else if ("STUDENTS".equalsIgnoreCase(targetRole)) {
            targets = userRepository.findByRole(Role.STUDENT);
        } else {
            // ALL = students + faculty
            targets = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.STUDENT || u.getRole() == Role.FACULTY)
                .toList();
        }

        // Save in-app notification for each
        for (User u : targets) {
            notificationRepository.save(Notification.builder()
                .user(u).title(subject).message(message)
                .type(type).read(false).build());
        }

        // Send emails async so the API doesn't block
        sendEmailsToStudents(targets, subject, message);

        log.info("Broadcast '{}' sent to {} users", subject, targets.size());
        return targets.size();
    }

    // ── Send emails to individual student about their own result ─────────────
    @Async
    public void sendResultEmailToStudent(User student, String examName,
                                          String marks, String grade, String examType) {
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(student.getEmail());
            mail.setSubject("[CampusIQ+] " +
                (examType.equalsIgnoreCase("MID") ? "Mid-Term" : "Semester") +
                " Result Published – " + examName);
            mail.setText(
                "Dear " + student.getName() + ",\n\n" +
                "Your result for '" + examName + "' has been published.\n\n" +
                "Marks Obtained: " + marks + "\n" +
                "Grade: " + grade + "\n\n" +
                "Login to CampusIQ+ portal to view your full result and GPA.\n\n" +
                "Regards,\nCampusIQ+ Academic Team"
            );
            mailSender.send(mail);
        } catch (Exception e) {
            log.warn("Could not send result email to {}: {}", student.getEmail(), e.getMessage());
        }
    }

    // ── Internal: async bulk email sender ────────────────────────────────────
    @Async
    protected void sendEmailsToStudents(List<User> users, String subject, String body) {
        int sent = 0;
        for (User u : users) {
            try {
                SimpleMailMessage mail = new SimpleMailMessage();
                mail.setTo(u.getEmail());
                mail.setSubject("[CampusIQ+] " + subject);
                mail.setText("Dear " + u.getName() + ",\n\n" + body +
                    "\n\nRegards,\nCampusIQ+ Team");
                mailSender.send(mail);
                sent++;
            } catch (Exception e) {
                log.warn("Failed to send mail to {}: {}", u.getEmail(), e.getMessage());
            }
        }
        log.info("Emails sent: {}/{}", sent, users.size());
    }
}

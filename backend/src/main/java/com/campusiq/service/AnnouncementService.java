package com.campusiq.service;

import com.campusiq.dto.request.AnnouncementRequest;
import com.campusiq.entity.Notification;
import com.campusiq.entity.Role;
import com.campusiq.entity.User;
import com.campusiq.repository.NotificationRepository;
import com.campusiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnnouncementService {

    private final UserRepository         userRepository;
    private final NotificationRepository notificationRepository;
    private final JavaMailSender         mailSender;

    public record AnnouncementResult(
        int totalStudents,
        int emailsSent,
        int notificationsSaved,
        int failures
    ) {}

    /**
     * Send announcement to ALL students (or specific ones).
     * Saves in-app notification + sends email.
     * Returns result counts.
     */
    public AnnouncementResult send(AnnouncementRequest req) {
        List<User> targets;
        if (req.getTargetUserIds() != null && !req.getTargetUserIds().isEmpty()) {
            targets = userRepository.findAllById(req.getTargetUserIds());
        } else {
            targets = userRepository.findByRole(Role.STUDENT);
        }

        int emails = 0, notifs = 0, fails = 0;
        String icon = typeIcon(req.getType());

        for (User user : targets) {

            // 1. Save in-app notification
            if (req.isSaveNotification()) {
                try {
                    Notification n = Notification.builder()
                        .user(user)
                        .title(icon + " " + req.getSubject())
                        .message(req.getBody())
                        .type(Notification.NotificationType.GENERAL)
                        .read(false)
                        .build();
                    notificationRepository.save(n);
                    notifs++;
                } catch (Exception e) {
                    log.warn("Notification fail for user {}: {}", user.getId(), e.getMessage());
                    fails++;
                }
            }

            // 2. Send email
            if (req.isSendEmail() && user.getEmail() != null && !user.getEmail().isBlank()) {
                try {
                    SimpleMailMessage mail = new SimpleMailMessage();
                    mail.setTo(user.getEmail());
                    mail.setSubject("[CampusIQ+] " + req.getSubject());
                    mail.setText(buildBody(user.getName(), req, icon));
                    mailSender.send(mail);
                    emails++;
                } catch (Exception e) {
                    log.warn("Email fail for {}: {}", user.getEmail(), e.getMessage());
                    fails++;
                }
            }
        }

        log.info("Announcement '{}' → {} students | {} emails | {} notifs | {} fails",
            req.getSubject(), targets.size(), emails, notifs, fails);

        return new AnnouncementResult(targets.size(), emails, notifs, fails);
    }

    private String buildBody(String name, AnnouncementRequest req, String icon) {
        return String.format(
            "Dear %s,\n\n%s %s\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n%s\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            "Log in to CampusIQ+ for more details.\n\nRegards,\nCampusIQ+ Administration",
            name, icon, req.getSubject(), req.getBody()
        );
    }

    private String typeIcon(String type) {
        if (type == null) return "📢";
        return switch (type.toUpperCase()) {
            case "HOLIDAY" -> "🏖️";
            case "EXAM"    -> "📝";
            case "EVENT"   -> "🎉";
            case "RESULT"  -> "📋";
            default        -> "📢";
        };
    }
}

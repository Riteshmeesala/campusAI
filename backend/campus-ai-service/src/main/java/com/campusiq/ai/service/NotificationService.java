package com.campusiq.ai.service;

import com.campusiq.ai.entity.Notification;
import com.campusiq.ai.entity.Notification.NotificationType;
import com.campusiq.ai.entity.User;
import com.campusiq.ai.repository.NotificationRepository;
import com.campusiq.ai.repository.UserRepository;
import com.campusiq.common.enums.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

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

    @Transactional
    public Notification createNotification(User user, String title, String message,
                                           NotificationType type, Long refId) {
        return notificationRepository.save(Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(refId)
                .read(false)
                .build());
    }

    @Transactional
    public int broadcastToStudents(String subject, String message,
                                   String targetRole, NotificationType type) {
        List<User> targets;
        if ("FACULTY".equalsIgnoreCase(targetRole)) {
            targets = userRepository.findByRole(Role.FACULTY);
        } else if ("STUDENTS".equalsIgnoreCase(targetRole)) {
            targets = userRepository.findByRole(Role.STUDENT);
        } else {
            targets = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.STUDENT || u.getRole() == Role.FACULTY)
                    .toList();
        }

        for (User u : targets) {
            notificationRepository.save(Notification.builder()
                    .user(u)
                    .title(subject)
                    .message(message)
                    .type(type)
                    .read(false)
                    .build());
        }

        log.info("Broadcast '{}' sent to {} users", subject, targets.size());
        return targets.size();
    }
}

package com.campusiq.ai.config;

import com.campusiq.ai.entity.Notification;
import com.campusiq.ai.entity.Notification.NotificationType;
import com.campusiq.ai.entity.User;
import com.campusiq.ai.repository.NotificationRepository;
import com.campusiq.ai.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public DataInitializer(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        log.info("Campus AI & Notification service initialized. Ready for user-created notifications and AI analytics.");
    }
}

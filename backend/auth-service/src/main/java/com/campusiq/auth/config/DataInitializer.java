package com.campusiq.auth.config;

import com.campusiq.auth.entity.User;
import com.campusiq.auth.repository.UserRepository;
import com.campusiq.common.enums.Role;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Auth database already initialized — skipping initialization");
            return;
        }

        log.info("Initializing Auth database with initial System Admin account...");
        String adminPassword = passwordEncoder.encode("Admin@123");

        userRepository.save(User.builder()
                .username("admin")
                .name("System Admin")
                .email("admin@campusiq.com")
                .password(adminPassword)
                .role(Role.ADMIN)
                .phoneNumber("9000000001")
                .department("Administration")
                .active(true)
                .build());

        log.info("System Admin account initialized successfully (admin / Admin@123).");
    }
}

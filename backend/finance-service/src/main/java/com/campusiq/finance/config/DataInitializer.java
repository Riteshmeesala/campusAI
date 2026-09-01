package com.campusiq.finance.config;

import com.campusiq.finance.entity.Fee;
import com.campusiq.finance.entity.Fee.FeeStatus;
import com.campusiq.finance.entity.User;
import com.campusiq.finance.repository.FeeRepository;
import com.campusiq.finance.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final FeeRepository feeRepository;
    private final UserRepository userRepository;

    public DataInitializer(FeeRepository feeRepository, UserRepository userRepository) {
        this.feeRepository = feeRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        log.info("Finance service initialized. Ready for user-created fee structures and student fee records.");
    }
}

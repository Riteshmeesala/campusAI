package com.campusiq.auth.service;

import com.campusiq.auth.entity.User;
import com.campusiq.auth.repository.UserRepository;
import com.campusiq.common.exception.BadRequestException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private final UserRepository userRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    @Value("${app.otp.length:6}")
    private int otpLength;

    @Value("${app.mail.from:noreply@campusiq.com}")
    private String fromEmail;

    public OtpService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void generateAndSendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found with email: " + email));

        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(otpExpiryMinutes));
        userRepository.save(user);

        if (mailSender != null) {
            sendOtpEmail(email, user.getName(), otp);
        } else {
            log.warn("JavaMailSender not configured. OTP for {} is: {}", email, otp);
        }
        log.info("OTP generated for user: {}", email);
    }

    @Transactional
    public boolean verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found with email: " + email));

        if (user.getOtpCode() == null || user.getOtpExpiry() == null) {
            throw new BadRequestException("No OTP found. Please request a new OTP.");
        }
        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            clearOtp(user);
            throw new BadRequestException("OTP has expired. Please request a new OTP.");
        }
        if (!user.getOtpCode().equals(otp)) {
            throw new BadRequestException("Invalid OTP.");
        }
        clearOtp(user);
        userRepository.save(user);
        return true;
    }

    private void clearOtp(User user) {
        user.setOtpCode(null);
        user.setOtpExpiry(null);
    }

    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < otpLength; i++) sb.append(random.nextInt(10));
        return sb.toString();
    }

    private void sendOtpEmail(String to, String name, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("CampusIQ+ - Your OTP for Login");
            helper.setText("<html><body><h2>Your OTP: <b>" + otp + "</b></h2><p>Valid for "
                    + otpExpiryMinutes + " minutes.</p></body></html>", true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
        }
    }
}

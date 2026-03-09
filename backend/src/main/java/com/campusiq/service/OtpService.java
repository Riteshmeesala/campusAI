package com.campusiq.service;

import com.campusiq.entity.User;
import com.campusiq.exception.BadRequestException;
import com.campusiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@Slf4j
public class OtpService {

    private final UserRepository userRepository;

    // Optional — if mail is not configured, OTP will just be logged
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
            // Mail not configured — log the OTP for development
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
            log.info("OTP email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", to, e.getMessage());
            // Don't throw — OTP is still saved in DB, user can check backend logs in dev
        }
    }
}

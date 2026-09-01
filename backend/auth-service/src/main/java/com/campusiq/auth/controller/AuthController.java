package com.campusiq.auth.controller;

import com.campusiq.auth.dto.request.LoginRequest;
import com.campusiq.auth.dto.request.OtpVerifyRequest;
import com.campusiq.auth.dto.request.RegisterRequest;
import com.campusiq.auth.dto.response.AuthResponse;
import com.campusiq.auth.entity.User;
import com.campusiq.auth.repository.UserRepository;
import com.campusiq.auth.service.AuthService;
import com.campusiq.auth.service.OtpService;
import com.campusiq.common.dto.ApiResponse;
import com.campusiq.common.exception.ResourceNotFoundException;
import com.campusiq.common.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService,
                          OtpService otpService,
                          UserRepository userRepository) {
        this.authService = authService;
        this.otpService = otpService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(req), "Login successful"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(authService.register(req), "Registered successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody OtpVerifyRequest req) {
        boolean valid = otpService.verifyOtp(req.getEmail(), req.getOtp());
        if (!valid) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid or expired OTP"));
        }
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", req.getEmail()));
        return ResponseEntity.ok(ApiResponse.success(authService.buildAuthResponse(user), "OTP verified"));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<String>> resendOtp(@RequestParam String email) {
        otpService.generateAndSendOtp(email);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email", "OTP sent"));
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<ApiResponse<String>> enable2FA(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Two-factor authentication enabled"));
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<ApiResponse<String>> disable2FA(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null || principal.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized"));
        }
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", principal.getId()));
        user.setTwoFactorEnabled(false);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Two-factor authentication disabled"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<String>> me() {
        return ResponseEntity.ok(ApiResponse.success("authenticated"));
    }
}

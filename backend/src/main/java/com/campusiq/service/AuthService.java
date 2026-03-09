package com.campusiq.service;

import com.campusiq.dto.request.LoginRequest;
import com.campusiq.dto.request.RegisterRequest;
import com.campusiq.dto.response.AuthResponse;
import com.campusiq.entity.*;
import com.campusiq.exception.*;
import com.campusiq.repository.UserRepository;
import com.campusiq.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor @Slf4j
public class AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider      tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new ResourceConflictException("Email already in use");
        if (userRepository.existsByUsername(req.getUsername()))
            throw new ResourceConflictException("Username already taken");

        User user = User.builder()
            .username(req.getUsername())
            .name(req.getName())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .role(req.getRole() != null ? req.getRole() : Role.STUDENT)
            .phoneNumber(req.getPhoneNumber())
            .department(req.getDepartment())
            .enrollmentNumber(req.getEnrollmentNumber())
            .active(true)
            .twoFactorEnabled(false)
            .build();
        userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        // Authenticate — Spring Security calls loadUserByUsername(req.getUsername())
        // Our CustomUserDetailsService supports both username AND email login
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Fetch the full User entity (auth only gives us UserPrincipal)
        User user = userRepository.findByUsername(req.getUsername())
            .or(() -> userRepository.findByEmail(req.getUsername()))
            .orElseThrow(() -> new BadRequestException("User not found"));

        log.info("Login successful: {} ({})", user.getUsername(), user.getRole());
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token   = tokenProvider.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        String refresh = tokenProvider.generateRefreshToken(user.getEmail(), user.getId(), user.getRole().name());
        return AuthResponse.builder()
            .accessToken(token).refreshToken(refresh).tokenType("Bearer")
            .userId(user.getId()).username(user.getUsername())
            .name(user.getName()).email(user.getEmail())
            .role(user.getRole())
            .twoFactorEnabled(false).twoFactorRequired(false)
            .build();
    }
}

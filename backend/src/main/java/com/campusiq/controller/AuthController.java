package com.campusiq.controller;

import com.campusiq.dto.request.LoginRequest;
import com.campusiq.dto.request.RegisterRequest;
import com.campusiq.dto.response.ApiResponse;
import com.campusiq.dto.response.AuthResponse;
import com.campusiq.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(req), "Login successful"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(authService.register(req), "Registered successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<String>> me() {
        return ResponseEntity.ok(ApiResponse.success("authenticated"));
    }
}

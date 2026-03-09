package com.campusiq.dto.request;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class LoginRequest {
    // 'username' field — user types their email address here
    // AuthContext sends { username: "...", password: "..." }
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;
}
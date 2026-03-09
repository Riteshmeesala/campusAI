package com.campusiq.dto.response;

import com.campusiq.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String name;
    private String email;
    private Role role;
    private boolean twoFactorRequired;
    private boolean twoFactorEnabled;
}

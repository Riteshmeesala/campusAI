package com.campusiq.auth.dto.response;

import com.campusiq.common.enums.Role;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
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

    public AuthResponse() {}

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public boolean isTwoFactorRequired() { return twoFactorRequired; }
    public void setTwoFactorRequired(boolean twoFactorRequired) { this.twoFactorRequired = twoFactorRequired; }
    public boolean isTwoFactorEnabled() { return twoFactorEnabled; }
    public void setTwoFactorEnabled(boolean twoFactorEnabled) { this.twoFactorEnabled = twoFactorEnabled; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final AuthResponse resp = new AuthResponse();
        public Builder accessToken(String accessToken) { resp.setAccessToken(accessToken); return this; }
        public Builder refreshToken(String refreshToken) { resp.setRefreshToken(refreshToken); return this; }
        public Builder tokenType(String tokenType) { resp.setTokenType(tokenType); return this; }
        public Builder userId(Long userId) { resp.setUserId(userId); return this; }
        public Builder username(String username) { resp.setUsername(username); return this; }
        public Builder name(String name) { resp.setName(name); return this; }
        public Builder email(String email) { resp.setEmail(email); return this; }
        public Builder role(Role role) { resp.setRole(role); return this; }
        public Builder twoFactorRequired(boolean req) { resp.setTwoFactorRequired(req); return this; }
        public Builder twoFactorEnabled(boolean en) { resp.setTwoFactorEnabled(en); return this; }
        public AuthResponse build() { return resp; }
    }
}

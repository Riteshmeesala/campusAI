package com.campusiq.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_email",    columnList = "email",    unique = true),
    @Index(name = "idx_users_username", columnList = "username", unique = true),
    @Index(name = "idx_users_role",     columnList = "role")
})
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Column(nullable = false, unique = true, length = 50)
    private String username;

    @NotBlank @Column(nullable = false, length = 100)
    private String name;

    @NotBlank @Email @Column(nullable = false, unique = true, length = 150)
    private String email;

    @JsonIgnore
    @NotBlank @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "enrollment_number", unique = true, length = 50)
    private String enrollmentNumber;

    @Builder.Default
    @Column(name = "is_active")
    private boolean active = true;

    @Builder.Default
    @Column(name = "is_two_factor_enabled")
    private boolean twoFactorEnabled = false;

    @JsonIgnore
    @Column(name = "otp_code", length = 10)
    private String otpCode;

    @JsonIgnore
    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

    @JsonIgnore
    @Column(name = "fcm_token", length = 500)
    private String fcmToken;

    @CreationTimestamp @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // All collections ignored to prevent circular JSON and lazy loading issues
    @JsonIgnore
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default private List<Attendance> attendances = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default private List<Fee> fees = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default private List<Result> results = new ArrayList<>();
}

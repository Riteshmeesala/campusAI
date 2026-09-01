package com.campusiq.common.security;

import com.campusiq.common.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String lookupKey;
    private final String name;
    private final String email;
    @JsonIgnore
    private final String password;
    private final Role role;
    private final boolean active;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, String lookupKey, String name, String email,
                         String password, Role role, boolean active) {
        this.id = id;
        this.lookupKey = lookupKey != null ? lookupKey : email;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role != null ? role : Role.STUDENT;
        this.active = active;
        this.authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + (this.role != null ? this.role.name() : "STUDENT"))
        );
    }

    public static UserPrincipal create(Long id, String email, String name, Role role) {
        return new UserPrincipal(id, email, name, email, "", role, true);
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return lookupKey;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}

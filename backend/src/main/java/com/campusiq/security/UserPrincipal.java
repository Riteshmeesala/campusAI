package com.campusiq.security;

import com.campusiq.entity.Role;
import com.campusiq.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
public class UserPrincipal implements UserDetails {

    private final Long   id;
    private final String lookupKey;
    private final String name;
    private final String email;
    @JsonIgnore private final String password;
    private final Role   role;
    private final boolean active;
    private final Collection<? extends GrantedAuthority> authorities;

    private User user; // stored for easy access

    private UserPrincipal(Long id, String lookupKey, String name, String email,
                          String password, Role role, boolean active) {
        this.id = id;
        this.lookupKey = lookupKey;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.active = active;
        this.authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    /** Get the full User entity for controllers */
    public User getUser() { return this.user; }

    public static UserPrincipal create(User user, String lookupKey) {
        UserPrincipal up = new UserPrincipal(user.getId(), lookupKey, user.getName(),
            user.getEmail(), user.getPassword(), user.getRole(), user.isActive());
        up.user = user;
        return up;
    }

    public static UserPrincipal create(User user) {
        return create(user, user.getEmail());
    }

    @Override public String getUsername()              { return lookupKey; }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return active; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return active; }
}

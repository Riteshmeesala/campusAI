package com.campusiq.security;

import com.campusiq.entity.User;
import com.campusiq.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Called by Spring Security with whatever credential the user typed.
     * We support login by USERNAME or EMAIL.
     *
     * CRITICAL: We pass the same credential string as the lookupKey to UserPrincipal
     * so that UserPrincipal.getUsername() returns it unchanged.
     * Spring Security verifies: loadUserByUsername(input).getUsername().equals(input)
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String credential) throws UsernameNotFoundException {
        // Try username first
        User user = userRepository.findByUsername(credential).orElse(null);
        if (user == null) {
            // Try email as fallback (used by JWT filter — email is stored in token subject)
            user = userRepository.findByEmail(credential)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + credential));
        }
        return UserPrincipal.create(user, credential);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + id));
        return UserPrincipal.create(user); // uses email — for JWT path
    }
}

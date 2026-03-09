package com.campusiq.repository;
import com.campusiq.entity.Role;
import com.campusiq.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEnrollmentNumber(String enrollmentNumber);
    List<User> findByRole(Role role);
    long countByRole(Role role);
    Optional<User> findByUsernameOrEmail(String username, String email);
}

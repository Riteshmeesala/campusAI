package com.campusiq.repository;

import com.campusiq.entity.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface FeeRepository extends JpaRepository<Fee, Long> {

    List<Fee> findByStudentId(Long studentId);

    List<Fee> findByStudentOrderByDueDateDesc(com.campusiq.entity.User student);

    // FIX: was causing WARN "Specified result type [BigDecimal] did not match Query selection type [Fee]"
    // because Spring tried to derive the query from the method name and returned a Fee entity.
    // Must use explicit @Query with SUM() to return BigDecimal.
    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM Fee f WHERE f.student.id = :sid AND f.status IN ('PENDING', 'OVERDUE')")
    BigDecimal sumPendingByStudent(@Param("sid") Long sid);

    // Keep this alias so ChatbotService (old version) also compiles without error
    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM Fee f WHERE f.student.id = :userId AND f.status IN ('PENDING', 'OVERDUE')")
    BigDecimal findTotalPendingAmountByStudent(@Param("userId") Long userId);
}
package com.campusiq.finance.repository;

import com.campusiq.finance.entity.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findByStudentId(Long studentId);
    List<Fee> findByStudentIdAndStatus(Long studentId, Fee.FeeStatus status);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM Fee f WHERE f.student.id = :sid AND f.status = 'PENDING'")
    BigDecimal sumPendingByStudent(@Param("sid") Long studentId);
}

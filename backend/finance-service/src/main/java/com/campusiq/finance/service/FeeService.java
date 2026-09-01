package com.campusiq.finance.service;

import com.campusiq.common.exception.ResourceNotFoundException;
import com.campusiq.finance.dto.FeeRequest;
import com.campusiq.finance.entity.Fee;
import com.campusiq.finance.entity.Fee.FeeStatus;
import com.campusiq.finance.entity.User;
import com.campusiq.finance.repository.FeeRepository;
import com.campusiq.finance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class FeeService {

    private final FeeRepository feeRepository;
    private final UserRepository userRepository;

    public FeeService(FeeRepository feeRepository, UserRepository userRepository) {
        this.feeRepository = feeRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Fee createFee(FeeRequest req) {
        User student = userRepository.findById(req.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", req.getStudentId()));
        return feeRepository.save(Fee.builder()
                .student(student)
                .feeType(req.getFeeType())
                .amount(req.getAmount())
                .dueDate(req.getDueDate())
                .status(FeeStatus.PENDING)
                .description(req.getDescription())
                .academicYear(req.getAcademicYear())
                .semester(req.getSemester())
                .build());
    }

    public List<Fee> getStudentFees(Long studentId) {
        return feeRepository.findByStudentId(studentId);
    }

    public BigDecimal getPendingAmount(Long studentId) {
        BigDecimal amt = feeRepository.sumPendingByStudent(studentId);
        return amt != null ? amt : BigDecimal.ZERO;
    }

    public List<Fee> getAllFees() {
        return feeRepository.findAll();
    }

    public Fee getFeeById(Long id) {
        return feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee", "id", id));
    }

    @Transactional
    public Fee updateFee(Long id, Map<String, Object> updates) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee", "id", id));
        if (updates.containsKey("status")) {
            fee.setStatus(FeeStatus.valueOf((String) updates.get("status")));
            if (fee.getStatus() == FeeStatus.PAID && fee.getPaidDate() == null) {
                fee.setPaidDate(LocalDate.now());
            }
        }
        if (updates.containsKey("amount")) {
            fee.setAmount(new BigDecimal(updates.get("amount").toString()));
        }
        if (updates.containsKey("dueDate")) {
            fee.setDueDate(LocalDate.parse((String) updates.get("dueDate")));
        }
        if (updates.containsKey("description")) {
            fee.setDescription((String) updates.get("description"));
        }
        return feeRepository.save(fee);
    }

    @Transactional
    public Fee updateFeeStatus(Long id, String status) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee", "id", id));
        fee.setStatus(FeeStatus.valueOf(status));
        if (fee.getStatus() == FeeStatus.PAID && fee.getPaidDate() == null) {
            fee.setPaidDate(LocalDate.now());
        }
        return feeRepository.save(fee);
    }

    @Transactional
    public Fee markAsPaid(Long id, String orderId, String paymentId, String signature) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee", "id", id));
        fee.setStatus(FeeStatus.PAID);
        fee.setPaidDate(LocalDate.now());
        fee.setRazorpayOrderId(orderId);
        fee.setRazorpayPaymentId(paymentId);
        fee.setRazorpaySignature(signature);
        return feeRepository.save(fee);
    }

    @Transactional
    public void deleteFee(Long id) {
        if (!feeRepository.existsById(id))
            throw new ResourceNotFoundException("Fee", "id", id);
        feeRepository.deleteById(id);
    }
}

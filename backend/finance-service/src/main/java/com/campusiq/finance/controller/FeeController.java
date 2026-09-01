package com.campusiq.finance.controller;

import com.campusiq.common.dto.ApiResponse;
import com.campusiq.common.security.UserPrincipal;
import com.campusiq.finance.dto.FeeRequest;
import com.campusiq.finance.entity.Fee;
import com.campusiq.finance.service.FeeService;
import com.campusiq.finance.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/fees")
public class FeeController {

    private final FeeService feeService;
    private final PaymentService paymentService;

    public FeeController(FeeService feeService, PaymentService paymentService) {
        this.feeService = feeService;
        this.paymentService = paymentService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Fee>> create(@Valid @RequestBody FeeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(feeService.createFee(req), "Fee created"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Fee>>> myFees(@AuthenticationPrincipal UserPrincipal me) {
        if (me == null || me.getId() == null) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        return ResponseEntity.ok(ApiResponse.success(feeService.getStudentFees(me.getId())));
    }

    @GetMapping("/my/pending-amount")
    public ResponseEntity<ApiResponse<BigDecimal>> pending(@AuthenticationPrincipal UserPrincipal me) {
        if (me == null || me.getId() == null) {
            return ResponseEntity.ok(ApiResponse.success(BigDecimal.ZERO));
        }
        return ResponseEntity.ok(ApiResponse.success(feeService.getPendingAmount(me.getId())));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<Fee>>> studentFees(@PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(feeService.getStudentFees(studentId)));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Fee>>> all() {
        return ResponseEntity.ok(ApiResponse.success(feeService.getAllFees()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Fee>> update(@PathVariable Long id,
                                                   @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(ApiResponse.success(feeService.updateFee(id, updates), "Fee updated"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Fee>> updateStatus(@PathVariable Long id,
                                                         @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(
                feeService.updateFeeStatus(id, body.get("status")), "Status updated"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        feeService.deleteFee(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Fee deleted"));
    }

    @PostMapping("/{feeId}/create-order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(@PathVariable Long feeId) {
        Fee fee = feeService.getFeeById(feeId);
        String receipt = "fee_" + feeId + "_" + System.currentTimeMillis();
        Map<String, Object> order = paymentService.createOrder(receipt, fee.getAmount());
        order.put("feeId", feeId);
        return ResponseEntity.ok(ApiResponse.success(order, "Order created"));
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<ApiResponse<String>> verifyPayment(@RequestBody Map<String, String> body) {
        String orderId = body.get("razorpayOrderId");
        String paymentId = body.get("razorpayPaymentId");
        String signature = body.get("razorpaySignature");
        Long feeId = Long.parseLong(body.get("feeId"));

        boolean valid = paymentService.verifyPayment(orderId, paymentId, signature);

        if (valid) {
            feeService.markAsPaid(feeId, orderId, paymentId, signature);
            return ResponseEntity.ok(ApiResponse.success("PAYMENT_VERIFIED", "Payment successful"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Payment signature mismatch. Possible fraud."));
        }
    }
}

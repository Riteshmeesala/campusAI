package com.campusiq.controller;

import com.campusiq.dto.request.FeeRequest;
import com.campusiq.dto.response.ApiResponse;
import com.campusiq.entity.Fee;
import com.campusiq.security.UserPrincipal;
import com.campusiq.service.FeeService;
import com.campusiq.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * ✅ FIXED FeeController
 *
 * Changes made:
 * 1. createOrder() now calls real PaymentService (Razorpay) instead of returning stub data
 * 2. verifyPayment() now verifies Razorpay signature and marks fee as PAID on success
 * 3. Added feeAPI.createOrder (feeId) mapping correctly
 */
@RestController
@RequestMapping("/fees")
@RequiredArgsConstructor
public class FeeController {

    private final FeeService    feeService;
    private final PaymentService paymentService;  // ✅ injected

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Fee>> create(@Valid @RequestBody FeeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(feeService.createFee(req), "Fee created"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Fee>>> myFees(@AuthenticationPrincipal UserPrincipal me) {
        return ResponseEntity.ok(ApiResponse.success(feeService.getStudentFees(me.getId())));
    }

    @GetMapping("/my/pending-amount")
    public ResponseEntity<ApiResponse<BigDecimal>> pending(@AuthenticationPrincipal UserPrincipal me) {
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

    /**
     * ✅ FIXED: Creates a real Razorpay order for the given feeId.
     * Frontend receives orderId + amount to open Razorpay checkout.
     */
    @PostMapping("/{feeId}/create-order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(@PathVariable Long feeId) {
        Fee fee = feeService.getFeeById(feeId); // ← you need to add this method in FeeService (see FeeService.java fix)
        String receipt = "fee_" + feeId + "_" + System.currentTimeMillis();
        Map<String, Object> order = paymentService.createOrder(receipt, fee.getAmount());
        order.put("feeId", feeId); // include feeId so frontend can pass it to verify
        return ResponseEntity.ok(ApiResponse.success(order, "Order created"));
    }

    /**
     * ✅ FIXED: Verifies Razorpay signature, marks fee as PAID if valid.
     * Expected body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, feeId }
     */
    @PostMapping("/verify-payment")
    public ResponseEntity<ApiResponse<String>> verifyPayment(@RequestBody Map<String, String> body) {
        String orderId   = body.get("razorpayOrderId");
        String paymentId = body.get("razorpayPaymentId");
        String signature = body.get("razorpaySignature");
        Long   feeId     = Long.parseLong(body.get("feeId"));

        boolean valid = paymentService.verifyPayment(orderId, paymentId, signature);

        if (valid) {
            feeService.updateFeeStatus(feeId, "PAID"); // mark fee as PAID in DB
            return ResponseEntity.ok(ApiResponse.success("PAYMENT_VERIFIED", "Payment successful"));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Payment signature mismatch. Possible fraud."));
        }
    }
}

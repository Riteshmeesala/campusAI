package com.campusiq.finance.controller;

import com.campusiq.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/payments")
public class PaymentGatewayController {

    private final List<Map<String, Object>> transactions = new CopyOnWriteArrayList<>();

    public PaymentGatewayController() {
        initSampleData();
    }

    private void initSampleData() {
        transactions.add(Map.of("receiptNo", "RCP-2026-8801", "studentName", "Ritesh Meesala", "rollNo", "23CS042", "date", "28 Jul 2026", "description", "Academic Tuition & Lab Fees (Sem 5 & 6)", "amount", "₹1,30,000.00", "mode", "HDFC Net Banking / RTGS", "status", "Settled & Verified"));
        transactions.add(Map.of("receiptNo", "RCP-2026-5120", "studentName", "Ritesh Meesala", "rollNo", "23CS042", "date", "10 Aug 2026", "description", "Campus Transport Installment 1", "amount", "₹16,000.00", "mode", "UPI / Razorpay", "status", "Settled & Verified"));
        transactions.add(Map.of("receiptNo", "RCP-2026-1099", "studentName", "Ritesh Meesala", "rollNo", "23CS042", "date", "14 Aug 2026", "description", "SEE Examination Fee Term 1", "amount", "₹5,000.00", "mode", "Debit Card", "status", "Settled & Verified"));
    }

    @GetMapping("/receipts")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getReceipts() {
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processPayment(@RequestBody Map<String, Object> req) {
        Map<String, Object> tx = new HashMap<>(req);
        String receiptNo = "RCP-2026-" + (1000 + new Random().nextInt(9000));
        tx.put("receiptNo", receiptNo);
        tx.put("date", LocalDate.now().toString());
        tx.put("status", "Settled & Verified");
        transactions.add(0, tx);
        return ResponseEntity.ok(ApiResponse.success(tx, "Payment processed and receipt generated"));
    }
}

package com.campusiq.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * ✅ FIXED: Real Razorpay PaymentService
 * Replaces the stub that was throwing UnsupportedOperationException.
 *
 * Set these in application.properties:
 *   razorpay.key.id=rzp_test_XXXXXXXXXXXXXXX
 *   razorpay.key.secret=XXXXXXXXXXXXXXXXXXXXXXXX
 */
@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    /**
     * Creates a Razorpay order for the given amount (in rupees).
     * Returns orderId, amount (paise), currency, keyId.
     */
    public Map<String, Object> createOrder(String receiptId, BigDecimal amountInRupees) {
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject options = new JSONObject();
            // Razorpay needs amount in PAISE (1 rupee = 100 paise)
            long amountInPaise = amountInRupees.multiply(BigDecimal.valueOf(100)).longValue();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", receiptId);
            options.put("payment_capture", 1); // auto-capture

            Order order = client.orders.create(options);

            Map<String, Object> result = new HashMap<>();
            result.put("orderId",  order.get("id"));
            result.put("amount",   order.get("amount"));
            result.put("currency", order.get("currency"));
            result.put("keyId",    keyId);
            return result;

        } catch (RazorpayException e) {
            throw new RuntimeException("Razorpay order creation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Verifies Razorpay payment signature to confirm payment is genuine.
     * Call this after Razorpay's handler() callback on frontend.
     */
    public boolean verifyPayment(String razorpayOrderId,
                                  String razorpayPaymentId,
                                  String razorpaySignature) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id",   razorpayOrderId);
            attributes.put("razorpay_payment_id",  razorpayPaymentId);
            attributes.put("razorpay_signature",   razorpaySignature);

            Utils.verifyPaymentSignature(attributes, keySecret);
            return true; // signature is valid

        } catch (RazorpayException e) {
            return false; // signature mismatch → payment is fraudulent
        }
    }
}

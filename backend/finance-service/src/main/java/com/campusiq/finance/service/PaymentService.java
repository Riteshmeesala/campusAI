package com.campusiq.finance.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    @Value("${razorpay.key.id:rzp_test_campus_iq_demo}")
    private String keyId;

    @Value("${razorpay.key.secret:campus_iq_demo_secret}")
    private String keySecret;

    public Map<String, Object> createOrder(String receiptId, BigDecimal amountInRupees) {
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);

            JSONObject options = new JSONObject();
            long amountInPaise = amountInRupees.multiply(BigDecimal.valueOf(100)).longValue();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", receiptId);
            options.put("payment_capture", 1);

            Order order = client.orders.create(options);

            Map<String, Object> result = new HashMap<>();
            result.put("orderId", order.get("id"));
            result.put("amount", order.get("amount"));
            result.put("currency", order.get("currency"));
            result.put("keyId", keyId);
            return result;

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            throw new RuntimeException("Razorpay order creation failed: " + e.getMessage(), e);
        }
    }

    public boolean verifyPayment(String razorpayOrderId,
                                  String razorpayPaymentId,
                                  String razorpaySignature) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", razorpayOrderId);
            attributes.put("razorpay_payment_id", razorpayPaymentId);
            attributes.put("razorpay_signature", razorpaySignature);

            Utils.verifyPaymentSignature(attributes, keySecret);
            return true;
        } catch (RazorpayException e) {
            log.warn("Razorpay payment signature mismatch: {}", e.getMessage());
            return false;
        }
    }
}

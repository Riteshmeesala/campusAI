package com.campusiq.service;

import org.springframework.stereotype.Service;

/** Stub push notification service — integrate Firebase separately if needed. */
@Service
public class PushNotificationService {
    public void sendNotification(String token, String title, String body) {
        // Firebase not configured — no-op stub
    }
}

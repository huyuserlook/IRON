package com.example.IRON.service.interfaces;

import com.example.IRON.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {
    long getUnreadCount();
    List<NotificationResponse> getRecent(int limit);
}

package com.example.IRON.service.interfaces;

import com.example.IRON.entity.Notification;

import java.util.List;

public interface NotificationService {
    long getUnreadCount(Long userId);
    List<Notification> getRecent(int limit);
    void markAllAsRead(Long userId);
    Notification createNotification(String type, String title, String message, String link, Long relatedId);
}

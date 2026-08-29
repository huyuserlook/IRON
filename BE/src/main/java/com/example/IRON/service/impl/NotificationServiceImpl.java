package com.example.IRON.service.impl;

import com.example.IRON.entity.Notification;
import com.example.IRON.entity.AdminNotificationSetting;
import com.example.IRON.repository.AdminNotificationSettingRepository;
import com.example.IRON.repository.NotificationRepository;
import com.example.IRON.service.interfaces.NotificationService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final AdminNotificationSettingRepository settingRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   AdminNotificationSettingRepository settingRepository) {
        this.notificationRepository = notificationRepository;
        this.settingRepository = settingRepository;
    }

    @Override
    public long getUnreadCount(Long userId) {
        AdminNotificationSetting setting = settingRepository.findByUserId(userId).orElse(null);
        LocalDateTime since = setting != null && setting.getLastReadAt() != null
                ? setting.getLastReadAt()
                : LocalDateTime.now().minusDays(1);
        return notificationRepository.countByReadFalseAndCreatedAtAfter(since);
    }

    @Override
    public List<Notification> getRecent(int limit) {
        return notificationRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit));
    }

    @Override
    public void markAllAsRead(Long userId) {
        AdminNotificationSetting setting = settingRepository.getOrCreate(userId);
        setting.setLastReadAt(LocalDateTime.now());
        settingRepository.save(setting);
    }

    @Override
    public Notification createNotification(String type, String title, String message, String link, Long relatedId) {
        Notification notification = new Notification();
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setLink(link);
        notification.setRelatedId(relatedId);
        return notificationRepository.save(notification);
    }
}

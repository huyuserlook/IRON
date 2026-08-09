package com.example.IRON.repository;

import com.example.IRON.entity.AdminNotificationSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface AdminNotificationSettingRepository extends JpaRepository<AdminNotificationSetting, Long> {

    Optional<AdminNotificationSetting> findByUserId(Long userId);

    @Modifying
    @Query("UPDATE AdminNotificationSetting s SET s.lastReadAt = :lastReadAt WHERE s.userId = :userId")
    int updateLastReadAt(@Param("userId") Long userId, @Param("lastReadAt") LocalDateTime lastReadAt);

    default AdminNotificationSetting getOrCreate(Long userId) {
        return findByUserId(userId).orElseGet(() -> {
            AdminNotificationSetting s = new AdminNotificationSetting();
            s.setUserId(userId);
            return save(s);
        });
    }
}

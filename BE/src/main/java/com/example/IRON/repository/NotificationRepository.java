package com.example.IRON.repository;

import com.example.IRON.entity.Notification;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    long countByReadFalseAndCreatedAtAfter(LocalDateTime since);
    List<Notification> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime since, PageRequest pageable);
    List<Notification> findAllByOrderByCreatedAtDesc(PageRequest pageable);
}

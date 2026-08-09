package com.example.IRON.controller.admin;

import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.entity.Notification;
import com.example.IRON.entity.User;
import com.example.IRON.security.CustomUserDetailsService;
import com.example.IRON.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notifications")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final NotificationService notificationService;
    private final CustomUserDetailsService userDetailsService;

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<?>> getCount(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount(user.getId())));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getRecent(
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getRecent(limit)));
    }

    @PostMapping("/mark-read")
    public ResponseEntity<ApiResponse<?>> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Đánh dấu tất cả thông báo là đã đọc"));
    }
}

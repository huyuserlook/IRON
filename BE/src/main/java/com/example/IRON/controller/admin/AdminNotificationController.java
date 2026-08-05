package com.example.IRON.controller.admin;

import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.service.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/notifications")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final NotificationService notificationService;

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<?>> getCount() {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getRecent(
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.getRecent(limit)));
    }
}

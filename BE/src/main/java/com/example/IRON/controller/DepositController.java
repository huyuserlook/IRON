package com.example.IRON.controller;

import com.example.IRON.dto.request.CreateDepositRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.dto.response.DepositResponse;
import com.example.IRON.entity.User;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.UserRepository;
import com.example.IRON.service.interfaces.DepositService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/deposits")
@RequiredArgsConstructor
public class DepositController {

    private final DepositService depositService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@RequestBody CreateDepositRequest request) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                depositService.createDeposit(userId, request.getOrderId(), request),
                "Tạo đặt cọc thành công"
        ));
    }

    @GetMapping("/my-deposits")
    public ResponseEntity<ApiResponse<?>> getMyDeposits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                depositService.getMyDeposits(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()))
        ));
    }

    @GetMapping("/{depositId}")
    public ResponseEntity<ApiResponse<?>> getDetail(@PathVariable Long depositId) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                depositService.getMyDeposit(depositId, userId)
        ));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<?>> getByOrderId(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(
                depositService.getDepositByOrderId(orderId)
        ));
    }

    @PostMapping("/{depositId}/pay-remaining")
    public ResponseEntity<ApiResponse<?>> payRemaining(@PathVariable Long depositId) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                depositService.payRemaining(depositId, userId),
                "Yêu cầu thanh toán phần còn lại thành công"
        ));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                depositService.getAllDeposits(PageRequest.of(page, size, Sort.by("createdAt").descending()))
        ));
    }

    @GetMapping("/admin/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                depositService.getDepositById(id)
        ));
    }

    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<?>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false, defaultValue = "") String note) {
        Long actorId = getCurrentUserId();
        String actorEmail = getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success(
                depositService.updateStatus(id, status, note, actorId, actorEmail),
                "Cập nhật trạng thái thành công"
        ));
    }

    @PostMapping("/admin/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> refund(@PathVariable Long id, @RequestParam(required = false) String note) {
        Long actorId = getCurrentUserId();
        String actorEmail = getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponse.success(
                depositService.updateStatus(id, "REFUNDED", note != null ? note : "Hoàn cọc", actorId, actorEmail),
                "Hoàn cọc thành công"
        ));
    }

    private Long getCurrentUserId() {
        String email = getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return user.getId();
    }

    private String getCurrentUserEmail() {
        return org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
    }
}

package com.example.IRON.controller;

import com.example.IRON.dto.request.InstallmentRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.dto.response.InstallmentResponse;
import com.example.IRON.entity.User;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.UserRepository;
import com.example.IRON.service.interfaces.InstallmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class InstallmentController {

    private final InstallmentService installmentService;
    private final UserRepository userRepository;

    @PostMapping("/api/installment-requests")
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody InstallmentRequest request) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                installmentService.createInstallment(userId, request),
                "Đăng ký trả góp thành công"
        ));
    }

    @GetMapping("/api/installment-requests/my-requests")
    public ResponseEntity<ApiResponse<?>> getMyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                installmentService.getMyInstallments(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()))
        ));
    }

    @GetMapping("/api/installment-requests/my-requests/{id}")
    public ResponseEntity<ApiResponse<?>> getMyDetail(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.success(
                installmentService.getMyInstallment(id, userId)
        ));
    }

    @GetMapping("/api/admin/installment-requests")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                installmentService.getAllInstallments(PageRequest.of(page, size, Sort.by("createdAt").descending()), status)
        ));
    }

    @GetMapping("/api/admin/installment-requests/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<?>> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(
                installmentService.getInstallmentById(id)
        ));
    }

    @PatchMapping("/api/admin/installment-requests/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<?>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false, defaultValue = "") String note) {
        return ResponseEntity.ok(ApiResponse.success(
                installmentService.updateStatus(id, status, note),
                "Cập nhật trạng thái thành công"
        ));
    }

    @DeleteMapping("/api/admin/installment-requests/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        installmentService.deleteInstallment(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa thành công"));
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

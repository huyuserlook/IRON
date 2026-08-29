package com.example.IRON.controller.admin;

import com.example.IRON.dto.request.StaffCreateRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.entity.User;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.exception.UnauthorizedException;
import com.example.IRON.repository.UserRepository;
import com.example.IRON.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getAllUsers(PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<?>> toggleStatus(@PathVariable Long id) {
        userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật trạng thái người dùng thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa người dùng thành công"));
    }

    @PostMapping("/{id}/approve-password-reset")
    public ResponseEntity<ApiResponse<?>> approvePasswordReset(@PathVariable Long id) {
        userService.approvePasswordReset(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xác nhận yêu cầu đặt lại mật khẩu"));
    }

    @GetMapping("/password-reset-requests")
    public ResponseEntity<ApiResponse<?>> getPasswordResetRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getPendingPasswordResetRequests(PageRequest.of(page, size, Sort.by("passwordResetRequestedAt").descending()))));
    }

    // Staff management endpoints
    @GetMapping("/staff")
    public ResponseEntity<ApiResponse<?>> getStaff(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.getStaffUsers(PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @PostMapping("/staff")
    public ResponseEntity<ApiResponse<?>> createStaff(@RequestBody StaffCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.createStaff(request.getFullName(), request.getEmail(), request.getPassword(), request.getPhone()),
                "Tạo nhân viên thành công"));
    }

    @PatchMapping("/staff/{id}/toggle-status")
    public ResponseEntity<ApiResponse<?>> toggleStaffStatus(@PathVariable Long id) {
        userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật trạng thái nhân viên thành công"));
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<ApiResponse<?>> deleteStaff(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa nhân viên thành công"));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<?>> updateRole(
            @PathVariable Long id,
            @RequestParam String role,
            @RequestParam(required = false, defaultValue = "") String note) {
        String actorEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", actorEmail));
        return ResponseEntity.ok(ApiResponse.success(
                userService.updateUserRole(actor.getId(), actorEmail, id, role, note),
                "Cập nhật vai trò thành công"));
    }
}
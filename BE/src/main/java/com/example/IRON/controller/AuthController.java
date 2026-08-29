package com.example.IRON.controller;

import com.example.IRON.dto.request.*;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.service.interfaces.AuthService;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(request), "Đăng nhập thành công"));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.register(request), "Đăng ký thành công"));
    }

    @PostMapping("/social-login")
    public ResponseEntity<ApiResponse<?>> socialLogin(@Valid @RequestBody SocialLoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(authService.socialLogin(request), "Đăng nhập thành công"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<?>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Yêu cầu khôi phục mật khẩu đã được gửi đến email của bạn"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<?>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Mật khẩu đã được đặt lại thành công"));
    }

    @PostMapping("/forgot-password/phone")
    public ResponseEntity<ApiResponse<?>> forgotPasswordByPhone(@Valid @RequestBody PhoneForgotPasswordRequest request) {
        authService.forgotPasswordByPhone(request);

        com.example.IRON.entity.User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new ResourceNotFoundException("User", "phone", request.getPhone()));

        Map<String, Object> data = new HashMap<>();
        data.put("resetTokenApproved", user.getResetTokenApproved());
        data.put("hasRequest", user.getResetToken() != null && user.getResetTokenExpiry() != null &&
                user.getResetTokenExpiry().isAfter(LocalDateTime.now()));

        String message = Boolean.TRUE.equals(user.getResetTokenApproved())
                ? "Yêu cầu đã được admin duyệt. Vui lòng đặt mật khẩu mới."
                : "Đã gửi yêu cầu đặt lại mật khẩu. Vui lòng chờ admin xác nhận.";

        return ResponseEntity.ok(ApiResponse.success(data, message));
    }

    @GetMapping("/password-reset/status")
    public ResponseEntity<ApiResponse<?>> getPasswordResetStatus(@RequestParam String phone) {
        com.example.IRON.entity.User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User", "phone", phone));

        Map<String, Object> data = new HashMap<>();
        data.put("resetTokenApproved", user.getResetTokenApproved());
        data.put("hasRequest", user.getResetToken() != null && user.getResetTokenExpiry() != null &&
                user.getResetTokenExpiry().isAfter(LocalDateTime.now()));

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PostMapping("/reset-password/phone")
    public ResponseEntity<ApiResponse<?>> resetPasswordByPhone(@Valid @RequestBody PhoneResetPasswordRequest request) {
        authService.resetPasswordByPhone(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Mật khẩu đã được đặt lại thành công"));
    }
}
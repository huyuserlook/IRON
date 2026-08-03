package com.example.IRON.controller;

import com.example.IRON.dto.request.*;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.service.interfaces.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

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
}
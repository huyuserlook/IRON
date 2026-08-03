package com.example.IRON.controller;

import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.entity.User;
import com.example.IRON.security.CustomUserDetailsService;
import com.example.IRON.service.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final CustomUserDetailsService userDetailsService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<?>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(user.getId())));
    }
}

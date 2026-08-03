package com.example.IRON.controller;

import com.example.IRON.dto.request.BookingRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.security.CustomUserDetailsService;
import com.example.IRON.service.interfaces.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final CustomUserDetailsService userDetailsService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookingRequest request) {
        Long userId = userDetailsService.loadUserEntityByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.create(userId, request), "Đặt lịch lái thử thành công"));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<?>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = userDetailsService.loadUserEntityByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(ApiResponse.success(
                bookingService.getMyBookings(userId, PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<?>> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userDetailsService.loadUserEntityByEmail(userDetails.getUsername()).getId();
        bookingService.cancel(id, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Hủy lịch thành công"));
    }
}
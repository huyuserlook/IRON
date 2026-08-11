package com.example.IRON.controller;

import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.service.interfaces.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public class StaffController {

    private final StaffService staffService;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<?>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                staffService.getAllOrders(PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<?>> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(staffService.getOrderById(id)));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<?>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success(
                staffService.updateOrderStatus(id, status), "Cập nhật trạng thái đơn hàng thành công"));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<?>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                staffService.getAllBookings(PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<?>> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(staffService.getBookingById(id)));
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<?>> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success(
                staffService.updateBookingStatus(id, status), "Cập nhật trạng thái lịch lái thử thành công"));
    }

    @GetMapping("/motorcycles")
    public ResponseEntity<ApiResponse<?>> getAllMotorcycles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                staffService.getAllMotorcycles(PageRequest.of(page, size))));
    }
}

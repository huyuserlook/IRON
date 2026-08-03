package com.example.IRON.controller.admin;

import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.entity.Order;
import com.example.IRON.service.interfaces.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(required = false) Order.OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getAllOrders(status, PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getById(id)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<?>> updateStatus(
            @PathVariable Long id,
            @RequestParam Order.OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.updateStatus(id, status), "Cập nhật trạng thái thành công"));
    }
}
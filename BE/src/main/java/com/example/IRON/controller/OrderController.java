package com.example.IRON.controller;

import com.example.IRON.dto.request.OrderRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.entity.User;
import com.example.IRON.security.CustomUserDetailsService;
import com.example.IRON.service.interfaces.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final CustomUserDetailsService userDetailsService;

    public OrderController(OrderService orderService,
                           CustomUserDetailsService userDetailsService) {
        this.orderService = orderService;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderRequest request) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                orderService.createOrder(user.getId(), request), "Đặt hàng thành công"));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<?>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getMyOrders(user.getId(),
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<ApiResponse<?>> getOrder(@PathVariable String orderCode) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getByOrderCode(orderCode)));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<?>> cancelOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
        orderService.cancelOrder(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Hủy đơn hàng thành công"));
    }
}
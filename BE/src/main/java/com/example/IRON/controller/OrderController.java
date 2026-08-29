package com.example.IRON.controller;

import com.example.IRON.dto.request.OrderRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.entity.Order;
import com.example.IRON.entity.Payment;
import com.example.IRON.entity.User;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.OrderRepository;
import com.example.IRON.repository.PaymentRepository;
import com.example.IRON.security.CustomUserDetailsService;
import com.example.IRON.service.interfaces.OrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final CustomUserDetailsService userDetailsService;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public OrderController(OrderService orderService,
                           CustomUserDetailsService userDetailsService,
                           OrderRepository orderRepository,
                           PaymentRepository paymentRepository) {
        this.orderService = orderService;
        this.userDetailsService = userDetailsService;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
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

    @GetMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatus(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", id));

        Map<String, Object> status = new LinkedHashMap<>();
        status.put("orderId", order.getId());
        status.put("orderCode", order.getOrderCode());
        status.put("status", order.getStatus().name());

        Payment payment = paymentRepository.findByOrderId(id).orElse(null);
        if (payment != null) {
            status.put("paymentStatus", payment.getStatus().name());
            status.put("paymentMethod", payment.getPaymentMethod().name());
            status.put("paidAt", payment.getPaidAt());
        }

        return ResponseEntity.ok(ApiResponse.success(status));
    }
}
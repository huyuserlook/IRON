package com.example.IRON.controller;

import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.entity.Order;
import com.example.IRON.entity.Payment;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.OrderRepository;
import com.example.IRON.repository.PaymentRepository;
import com.example.IRON.security.CustomUserDetailsService;
import com.example.IRON.service.interfaces.PaymentService;
import com.example.IRON.utils.VietQrUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class VietQrController {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CustomUserDetailsService userDetailsService;
    private final PaymentService paymentService;

    @Value("${payment.vietqr.bank-code:MB}")
    private String bankCode;

    @Value("${payment.vietqr.account-no:161220054444}")
    private String accountNo;

    @Value("${payment.vietqr.account-name:HO XUAN HUY}")
    private String accountName;

    @PostMapping("/vietqr")
    public ResponseEntity<ApiResponse<?>> createVietQr(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody VietQrRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Don hang", "id", request.getOrderId()));

        if (userDetails != null) {
            try {
                var user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
                if (!order.getUser().getId().equals(user.getId())) {
                    throw new ResourceNotFoundException("Don hang", "id", request.getOrderId());
                }
            } catch (UsernameNotFoundException e) {
                throw new ResourceNotFoundException("Don hang", "id", request.getOrderId());
            }
        }

        Payment payment = paymentRepository.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toan", "orderId", request.getOrderId()));

        payment.setPaymentMethod(Payment.PaymentMethod.BANK_TRANSFER);
        payment.setAmount(request.getAmount());

        String noiDung = "DH" + order.getOrderCode();
        String qrCodeUrl = VietQrUtils.generateVietQrUrl(
                bankCode, accountNo, accountName,
                request.getAmount(),
                order.getId()
        );

        payment.setQrCodeUrl(qrCodeUrl);
        paymentRepository.save(payment);

        Map<String, Object> result = new HashMap<>();
        result.put("qrCodeUrl", qrCodeUrl);
        result.put("orderId", order.getId());
        result.put("status", "pending");
        result.put("bankInfo", Map.of(
                "account", accountNo,
                "bankName", bankCode,
                "accountName", accountName,
                "amount", request.getAmount(),
                "addInfo", noiDung
        ));

        return ResponseEntity.ok(ApiResponse.success(result, "Tao VietQR thanh cong"));
    }

    @PostMapping("/orders/{orderId}/confirm")
    public ResponseEntity<ApiResponse<?>> confirmOrder(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Don hang", "id", orderId));

        if (userDetails != null) {
            try {
                var user = userDetailsService.loadUserEntityByEmail(userDetails.getUsername());
                if (!order.getUser().getId().equals(user.getId())) {
                    throw new ResourceNotFoundException("Don hang", "id", orderId);
                }
            } catch (UsernameNotFoundException e) {
                throw new ResourceNotFoundException("Don hang", "id", orderId);
            }
        }

        paymentService.confirmPayment(orderId);

        Map<String, Object> result = new HashMap<>();
        result.put("orderId", orderId);
        result.put("status", "paid");
        return ResponseEntity.ok(ApiResponse.success(result, "Xac nhan thanh toan thanh cong"));
    }

    @GetMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<?>> getOrderStatus(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Don hang", "id", orderId));

        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);

        Map<String, Object> status = new HashMap<>();
        status.put("orderId", order.getId());
        status.put("orderCode", order.getOrderCode());

        String statusValue = "pending";
        if (payment != null && payment.getStatus() == Payment.PaymentStatus.PAID) {
            statusValue = "paid";
        } else if (order.getStatus() == Order.OrderStatus.CONFIRMED ||
                   order.getStatus() == Order.OrderStatus.PROCESSING ||
                   order.getStatus() == Order.OrderStatus.SHIPPING ||
                   order.getStatus() == Order.OrderStatus.DELIVERED) {
            statusValue = "paid";
        }
        status.put("status", statusValue);

        return ResponseEntity.ok(ApiResponse.success(status));
    }

    @Data
    public static class VietQrRequest {
        @NotNull(message = "orderId khong duoc de trong")
        private Long orderId;

        @NotNull(message = "amount khong duoc de trong")
        private BigDecimal amount;
    }
}

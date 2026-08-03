package com.example.IRON.controller;

import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.entity.Payment;
import com.example.IRON.service.interfaces.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<Payment>> getByOrderId(@PathVariable Long orderId) {
        return paymentService.getByOrderId(orderId)
                .map(p -> ResponseEntity.ok(ApiResponse.success(p)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/callback")
    public ResponseEntity<ApiResponse<?>> paymentCallback(
            @RequestParam Long orderId,
            @RequestParam String status,
            @RequestParam(required = false) String transactionId) {
        
        paymentService.updateStatus(orderId, Payment.PaymentStatus.valueOf(status), transactionId);
        return ResponseEntity.ok(ApiResponse.success(null, "Cập nhật trạng thái thanh toán thành công"));
    }
}

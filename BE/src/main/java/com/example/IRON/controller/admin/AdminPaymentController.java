package com.example.IRON.controller.admin;

import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.dto.response.PaymentResponse;
import com.example.IRON.service.interfaces.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/payments")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentService paymentService;

    @PostMapping("/{orderId}/confirm")
    public ResponseEntity<ApiResponse<PaymentResponse>> confirmPayment(@PathVariable Long orderId) {
        PaymentResponse response = paymentService.confirmPayment(orderId);
        return ResponseEntity.ok(ApiResponse.success(response, "Xác nhận thanh toán thành công"));
    }
}

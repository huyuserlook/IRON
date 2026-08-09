package com.example.IRON.controller;

import com.example.IRON.dto.request.PaymentRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.dto.response.PaymentResponse;
import com.example.IRON.entity.Payment;
import com.example.IRON.repository.PaymentRepository;
import com.example.IRON.service.interfaces.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;

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

    @PostMapping("/{orderId}/qr")
    public ResponseEntity<ApiResponse<PaymentResponse>> createQrPayment(
            @PathVariable Long orderId,
            @RequestBody PaymentRequest request) {
        Payment.PaymentMethod method = request.getPaymentMethod();
        PaymentResponse response = paymentService.createQrPayment(orderId, method);
        return ResponseEntity.ok(ApiResponse.success(response, "Tạo QR thanh toán thành công"));
    }

    @GetMapping("/{orderId}/qr")
    public ResponseEntity<ApiResponse<PaymentResponse>> getQrPayment(@PathVariable Long orderId) {
        PaymentResponse response = paymentService.getQrPayment(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{orderId}/submit-transaction")
    public ResponseEntity<ApiResponse<PaymentResponse>> submitTransactionRef(
            @PathVariable Long orderId,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        String ref = body != null ? body.get("transactionRef") : null;
        PaymentResponse response = paymentService.submitTransactionRef(orderId, ref);
        return ResponseEntity.ok(ApiResponse.success(response, "Gửi mã giao dịch thành công"));
    }

    @GetMapping("/payos/order-code/{payosOrderCode}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrderIdByPayosOrderCode(@PathVariable String payosOrderCode) {
        Payment payment = paymentRepository.findByPayosOrderCode(payosOrderCode)
                .orElseThrow(() -> new com.example.IRON.exception.ResourceNotFoundException("Thanh toán", "payosOrderCode", payosOrderCode));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderId", payment.getOrder().getId());
        result.put("orderCode", payment.getOrder().getOrderCode());
        result.put("paymentStatus", payment.getStatus().name());
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}

package com.example.IRON.controller.admin;

import com.example.IRON.dto.request.PaymentMethodRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.dto.response.PaymentMethodResponse;
import com.example.IRON.service.interfaces.PaymentMethodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/payment-methods")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminPaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentMethodResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(paymentMethodService.getAll()));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<PaymentMethodResponse>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success(paymentMethodService.getAllActive()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentMethodResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(paymentMethodService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentMethodResponse>> create(@Valid @RequestBody PaymentMethodRequest request) {
        return ResponseEntity.ok(ApiResponse.success(paymentMethodService.create(request), "Thêm phương thức thanh toán thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentMethodResponse>> update(@PathVariable Long id, @Valid @RequestBody PaymentMethodRequest request) {
        return ResponseEntity.ok(ApiResponse.success(paymentMethodService.update(id, request), "Cập nhật phương thức thanh toán thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        paymentMethodService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa phương thức thanh toán thành công"));
    }
}
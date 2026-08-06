package com.example.IRON.controller;

import com.example.IRON.config.MomoProperties;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.service.MomoService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MomoController {

    private final MomoService momoService;
    private final MomoProperties momoProperties;

    public MomoController(MomoService momoService, MomoProperties momoProperties) {
        this.momoService = momoService;
        this.momoProperties = momoProperties;
    }

    @PostMapping("/checkout/momo")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createMomoPayment(@Valid @RequestBody MomoPaymentRequest request) {
        try {
            Map<String, Object> result = momoService.createPayment(request.getOrderId(), request.getAmount(), request.getOrderInfo());
            return ResponseEntity.ok(ApiResponse.success(result, "Tạo thanh toán MoMo thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/webhook/momo")
    public ResponseEntity<Void> momoWebhook(@RequestBody(required = false) Map<String, String> params) {
        if (params == null || params.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        momoService.handleWebhook(params);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @Data
    public static class MomoPaymentRequest {
        @NotBlank(message = "orderId không được để trống")
        private String orderId;

        @NotNull(message = "amount không được để trống")
        private BigDecimal amount;

        @NotBlank(message = "orderInfo không được để trống")
        private String orderInfo;
    }
}

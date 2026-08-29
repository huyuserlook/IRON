package com.example.IRON.dto.request;

import com.example.IRON.entity.Payment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {

    @NotNull(message = "Phương thức thanh toán là bắt buộc")
    private Payment.PaymentMethod paymentMethod;

    @NotNull(message = "Số tiền là bắt buộc")
    private BigDecimal amount;

    private Long orderId;

    private String description;
}

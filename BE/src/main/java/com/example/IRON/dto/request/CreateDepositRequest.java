package com.example.IRON.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateDepositRequest {
    @NotNull(message = "ID đơn hàng không được để trống")
    private Long orderId;

    @NotNull(message = "Số tiền cọc không được để trống")
    @DecimalMin(value = "0.01", message = "Số tiền cọc phải lớn hơn 0")
    private BigDecimal depositAmount;

    private String paymentMethod = "CASH";
}

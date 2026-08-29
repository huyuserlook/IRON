package com.example.IRON.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class InstallmentRequest {
    @NotNull(message = "ID xe không được để trống")
    private Long motorcycleId;

    @NotNull(message = "Họ tên không được để trống")
    private String fullName;

    @NotNull(message = "Số điện thoại không được để trống")
    private String phone;

    @NotNull(message = "Email không được để trống")
    private String email;

    @NotNull(message = "CMND/CCCD không được để trống")
    private String idCardNumber;

    @NotNull(message = "Thu nhập hàng tháng không được để trống")
    private String monthlyIncome;

    @NotNull(message = "Số tiền trả trước không được để trống")
    @DecimalMin(value = "0", message = "Số tiền trả trước không hợp lệ")
    private BigDecimal downPayment;

    @NotNull(message = "Số tháng trả góp không được để trống")
    private Integer installmentMonths;

    private String customerNote;

    private Long orderId;
}

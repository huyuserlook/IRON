package com.example.IRON.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InstallmentResponse {
    private Long id;
    private Long orderId;
    private String fullName;
    private String phone;
    private String email;
    private String idCardNumber;
    private String monthlyIncome;
    private BigDecimal downPayment;
    private Integer installmentMonths;
    private Long motorcycleId;
    private String motorcycleName;
    private String customerNote;
    private String status;
    private String adminNote;
    private LocalDateTime createdAt;
}

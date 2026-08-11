package com.example.IRON.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DepositResponse {
    private Long id;
    private Long orderId;
    private String orderCode;
    private Long userId;
    private String userEmail;
    private String userName;
    private BigDecimal depositAmount;
    private BigDecimal totalAmount;
    private BigDecimal remainingAmount;
    private String status;
    private LocalDateTime deadlineDate;
    private LocalDateTime createdAt;
    private String note;
    private String paymentMethod;
    private String qrCodeUrl;
    private String paymentUrl;
    private String payosOrderCode;
}

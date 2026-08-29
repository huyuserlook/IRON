package com.example.IRON.dto.response;

import com.example.IRON.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private String orderCode;
    private BigDecimal amount;
    private Payment.PaymentMethod paymentMethod;
    private Payment.PaymentStatus status;
    private String transactionId;
    private String qrCodeUrl;
    private String qrCode;
    private String paymentUrl;
    private String bankAccount;
    private String bankName;
    private String bankBranch;
    private String qrDescription;
    private String deeplink;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
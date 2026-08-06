package com.example.IRON.service.interfaces;

import com.example.IRON.dto.response.PaymentResponse;
import com.example.IRON.entity.Payment;
import java.util.Optional;

public interface PaymentService {
    Payment createPayment(Long orderId, String method);
    Optional<Payment> getByOrderId(Long orderId);
    void updateStatus(Long orderId, Payment.PaymentStatus status, String transactionId);

    PaymentResponse createQrPayment(Long orderId, Payment.PaymentMethod method);
    PaymentResponse getQrPayment(Long orderId);
    String getVnpayPaymentUrl(Long orderId);
    PaymentResponse getBankTransferInfo(Long orderId);
    PaymentResponse submitTransactionRef(Long orderId, String transactionRef);
    PaymentResponse confirmPayment(Long orderId);
}

package com.example.IRON.service.interfaces;

import com.example.IRON.entity.Payment;
import java.util.Optional;

public interface PaymentService {
    Payment createPayment(Long orderId, String method);
    Optional<Payment> getByOrderId(Long orderId);
    void updateStatus(Long orderId, Payment.PaymentStatus status, String transactionId);
}

package com.example.IRON.service.impl;

import com.example.IRON.entity.Order;
import com.example.IRON.entity.Payment;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.OrderRepository;
import com.example.IRON.repository.PaymentRepository;
import com.example.IRON.service.interfaces.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public Payment createPayment(Long orderId, String method) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", orderId));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(method));
        payment.setStatus(Payment.PaymentStatus.PENDING);
        
        return paymentRepository.save(payment);
    }

    @Override
    public Optional<Payment> getByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    @Override
    @Transactional
    public void updateStatus(Long orderId, Payment.PaymentStatus status, String transactionId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "orderId", orderId));
        
        payment.setStatus(status);
        if (transactionId != null) payment.setTransactionId(transactionId);
        if (status == Payment.PaymentStatus.PAID) {
            payment.setPaidAt(LocalDateTime.now());
        }
        paymentRepository.save(payment);
    }
}

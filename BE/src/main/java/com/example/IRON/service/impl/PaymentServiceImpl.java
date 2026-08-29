package com.example.IRON.service.impl;

import com.example.IRON.config.PayOSProperties;
import com.example.IRON.dto.response.PaymentResponse;
import com.example.IRON.entity.Order;
import com.example.IRON.entity.Payment;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.OrderRepository;
import com.example.IRON.repository.PaymentRepository;
import com.example.IRON.service.PayOSService;
import com.example.IRON.service.interfaces.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PayOSService payOSService;
    private final PayOSProperties payOSProperties;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    @Transactional
    public Payment createPayment(Long orderId, String method) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", orderId));

        Payment payment = paymentRepository.findByOrderId(orderId).orElse(null);
        if (payment == null) {
            payment = new Payment();
            payment.setOrder(order);
        }
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

    @Override
    public PaymentResponse createQrPayment(Long orderId, Payment.PaymentMethod method) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "orderId", orderId));

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new IllegalStateException("Thanh toán đã được xử lý");
        }

        if (method == Payment.PaymentMethod.PAYOS) {
            if (payment.getPaymentUrl() != null && !payment.getPaymentUrl().isBlank()) {
                return toResponse(payment, payment.getQrCodeUrl(), "Quét mã QR hoặc mở link để thanh toán qua PayOS", payment.getPaymentUrl(), null, null, null);
            }
            Map<String, Object> payosResult;
            try {
                payosResult = payOSService.createPaymentLink(
                        orderId,
                        payment.getAmount(),
                        "Thanh toan don hang " + payment.getOrder().getOrderCode()
                );
            } catch (Exception e) {
                throw new RuntimeException("Lỗi tạo thanh toán PayOS: " + e.getMessage(), e);
            }
            String payosCheckoutUrl = (String) payosResult.get("checkoutUrl");
            String payosQrCodeUrl = (String) payosResult.get("qrCodeUrl");
            String payosQrCode = (String) payosResult.get("qrCode");
            String payosOrderCode = (String) payosResult.get("orderCode");

            payment.setPaymentUrl(payosCheckoutUrl);
            payment.setQrCodeUrl(payosQrCodeUrl);
            payment.setPayosOrderCode(payosOrderCode);
            paymentRepository.save(payment);

            PaymentResponse payosResponse = toResponse(payment, payosQrCodeUrl, "Quét mã QR hoặc mở link để thanh toán qua PayOS", payosCheckoutUrl, null, null, null);
            payosResponse.setQrCode(payosQrCode);
            return payosResponse;
        }

        throw new IllegalArgumentException("Phương thức thanh toán không hỗ trợ QR: " + method);
    }

    @Override
    public PaymentResponse getQrPayment(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "orderId", orderId));

        String qrBase64 = payment.getQrCodeUrl();
        if (qrBase64 != null && !qrBase64.isBlank() && !qrBase64.startsWith("data:") && !qrBase64.startsWith("http")) {
            qrBase64 = "data:image/png;base64," + qrBase64;
        }
        String description = "";
        String paymentUrl = payment.getPaymentUrl();

        if (payment.getPaymentMethod() == Payment.PaymentMethod.PAYOS) {
            description = "Quét mã QR hoặc mở link để thanh toán qua PayOS";
            if ((qrBase64 == null || qrBase64.isBlank()) && paymentUrl != null && !paymentUrl.isBlank()) {
                try {
                    qrBase64 = "data:image/png;base64," + com.example.IRON.utils.QrCodeUtils.generateQrCodeBase64(paymentUrl, 300, 300);
                } catch (Exception e) {
                    qrBase64 = null;
                }
            }
        }

        return toResponse(payment, qrBase64, description, paymentUrl, null, null, null);
    }

    @Override
    @Transactional
    public PaymentResponse submitTransactionRef(Long orderId, String transactionRef) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "orderId", orderId));

        payment.setTransactionId(transactionRef);
        payment.setStatus(Payment.PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        if (order != null && order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.COMPLETED);
            orderRepository.save(order);
        }

        return toResponse(payment, payment.getQrCodeUrl(),
                getQrDescription(payment.getPaymentMethod()),
                payment.getPaymentUrl(), null, null, null);
    }

    @Override
    @Transactional
    public PaymentResponse confirmPayment(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "orderId", orderId));

        payment.setStatus(Payment.PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        if (order != null && order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.COMPLETED);
            orderRepository.save(order);
        }

        return toResponse(payment, payment.getQrCodeUrl(),
                getQrDescription(payment.getPaymentMethod()),
                payment.getPaymentUrl(), null, null, null);
    }

    private String getQrDescription(Payment.PaymentMethod method) {
        if (method == Payment.PaymentMethod.PAYOS) {
            return "Quét mã QR hoặc mở link để thanh toán qua PayOS";
        }
        return "Thanh toán";
    }

    private PaymentResponse toResponse(Payment payment, String qrCodeUrl, String qrDescription,
                                       String paymentUrl, String bankAccount, String bankName, String deeplink) {
        Order order = payment.getOrder();
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(order.getId())
                .orderCode(order.getOrderCode())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .qrCodeUrl(qrCodeUrl)
                .paymentUrl(paymentUrl)
                .bankAccount(bankAccount)
                .bankName(bankName)
                .bankBranch(null)
                .qrDescription(qrDescription)
                .deeplink(deeplink)
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}

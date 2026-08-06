package com.example.IRON.service.impl;

import com.example.IRON.config.VnpayProperties;
import com.example.IRON.dto.response.PaymentResponse;
import com.example.IRON.entity.Order;
import com.example.IRON.entity.Payment;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.OrderRepository;
import com.example.IRON.repository.PaymentRepository;
import com.example.IRON.service.MomoService;
import com.example.IRON.service.interfaces.PaymentService;
import com.example.IRON.utils.QrCodeUtils;
import com.example.IRON.utils.VietQrUtils;
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
    private final VnpayProperties vnpayProperties;
    private final MomoService momoService;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${payment.qr.momo:/qr/qrmomo.jpg}")
    private String momoQrPath;

    @Value("${payment.qr.bank-transfer:/qr/qrmb.jpg}")
    private String bankTransferQrPath;

    @Value("${payment.bank.account:1234567890}")
    private String bankAccount;

    @Value("${payment.bank.name:Vietcombank}")
    private String bankName;

    @Value("${payment.bank.branch:Chi nhanh Ha Noi}")
    private String bankBranch;

    @Value("${payment.vietqr.bank-code:MB}")
    private String vietQrBankCode;

    @Value("${payment.vietqr.account-no:161220054444}")
    private String vietQrAccountNo;

    @Value("${payment.vietqr.account-name:HO XUAN HUY}")
    private String vietQrAccountName;

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

    @Override
    public PaymentResponse createQrPayment(Long orderId, Payment.PaymentMethod method) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "orderId", orderId));

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            throw new IllegalStateException("Thanh toán đã được xử lý");
        }

        String qrCodeUrl = null;
        String qrDescription = "";
        String paymentUrl = null;

        switch (method) {
            case MOMO:
                Map<String, Object> momoResult;
                try {
                    momoResult = momoService.createPayment(
                            String.valueOf(orderId),
                            payment.getAmount(),
                            "Thanh toán don hang " + payment.getOrder().getOrderCode()
                    );
                } catch (Exception e) {
                    throw new RuntimeException("Lỗi tạo thanh toán MoMo", e);
                }
                String momoQrUrl = (String) momoResult.get("qrCodeUrl");
                String momoPayUrl = (String) momoResult.get("payUrl");
                String momoDeeplink = (String) momoResult.get("deeplink");

                payment.setQrCodeUrl(momoQrUrl);
                payment.setPaymentUrl(momoPayUrl);
                paymentRepository.save(payment);

                return toResponse(payment, momoQrUrl, "Mở app MoMo → Quét mã QR", momoPayUrl, null, null, momoDeeplink);
            case BANK_TRANSFER:
                qrCodeUrl = VietQrUtils.generateVietQrUrl(
                        vietQrBankCode, vietQrAccountNo, vietQrAccountName,
                        payment.getAmount(),
                        payment.getOrder().getId()
                );
                qrDescription = "Quét mã QR để chuyển khoản ngân hàng";
                break;
            case VNPAY:
                paymentUrl = getVnpayPaymentUrl(orderId);
                try {
                    qrCodeUrl = QrCodeUtils.generateQrCodeBase64(paymentUrl, 300, 300);
                } catch (Exception e) {
                    throw new RuntimeException("Lỗi tạo QR code VNPay", e);
                }
                qrDescription = "Quét mã QR để thanh toán qua VNPay";
                payment.setPaymentUrl(paymentUrl);
                paymentRepository.save(payment);
                return toResponse(payment, qrCodeUrl, qrDescription, paymentUrl, null, null, null);
            default:
                throw new IllegalArgumentException("Phương thức thanh toán không hỗ trợ QR: " + method);
        }

        payment.setQrCodeUrl(qrCodeUrl);
        paymentRepository.save(payment);

        return toResponse(payment, qrCodeUrl, qrDescription, paymentUrl, bankAccount, bankName, null);
    }

    @Override
    public PaymentResponse getQrPayment(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "orderId", orderId));

        String qrBase64 = payment.getQrCodeUrl();
        String description = "";
        String paymentUrl = payment.getPaymentUrl();

        switch (payment.getPaymentMethod()) {
            case MOMO:
                description = "Quét mã QR MoMo để thanh toán";
                break;
            case BANK_TRANSFER:
                description = "Quét mã QR để chuyển khoản ngân hàng";
                break;
            case VNPAY:
                description = "Quét mã QR để thanh toán qua VNPay";
                break;
            default:
                description = "Thanh toán";
        }

        return toResponse(payment, qrBase64, description, paymentUrl, null, null, null);
    }

    @Override
    public String getVnpayPaymentUrl(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "orderId", orderId));

        Order order = payment.getOrder();
        String vnpTxnRef = order.getOrderCode();
        String amount = payment.getAmount().multiply(BigDecimal.valueOf(100)).longValue() + "";
        String orderInfo = "Thanh toán don hang " + order.getOrderCode();
        String returnUrl = baseUrl + "/api/payments/callback";

        String vnpayUrl = vnpayProperties.getPaymentUrl()
                + "?vnp_TmnCode=" + vnpayProperties.getTmnCode()
                + "&vnp_Amount=" + amount
                + "&vnp_Command=pay"
                + "&vnp_CreateDate=" + LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"))
                + "&vnp_CurrCode=VND"
                + "&vnp_IpAddr=127.0.0.1"
                + "&vnp_Locale=" + vnpayProperties.getLocale()
                + "&vnp_OrderInfo=" + java.net.URLEncoder.encode(orderInfo, java.nio.charset.StandardCharsets.UTF_8)
                + "&vnp_OrderType=other"
                + "&vnp_ReturnUrl=" + java.net.URLEncoder.encode(returnUrl, java.nio.charset.StandardCharsets.UTF_8)
                + "&vnp_TxnRef=" + vnpTxnRef
                + "&vnp_Version=" + vnpayProperties.getVersion();

        payment.setPaymentUrl(vnpayUrl);
        paymentRepository.save(payment);

        return vnpayUrl;
    }

    @Override
    public PaymentResponse submitTransactionRef(Long orderId, String transactionRef) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "orderId", orderId));

        payment.setTransactionId(transactionRef);
        payment.setStatus(Payment.PaymentStatus.PAID);
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        if (order != null && order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);
        }

        return toResponse(payment, payment.getQrCodeUrl(),
                getQrDescription(payment.getPaymentMethod()),
                payment.getPaymentUrl(),
                payment.getPaymentMethod() == Payment.PaymentMethod.BANK_TRANSFER ? bankAccount : null,
                payment.getPaymentMethod() == Payment.PaymentMethod.BANK_TRANSFER ? bankName : null,
                null);
    }

    @Override
    public PaymentResponse confirmPayment(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "orderId", orderId));

        payment.setStatus(Payment.PaymentStatus.PAID);
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        if (order != null && order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);
        }

        return toResponse(payment, payment.getQrCodeUrl(),
                getQrDescription(payment.getPaymentMethod()),
                payment.getPaymentUrl(),
                payment.getPaymentMethod() == Payment.PaymentMethod.BANK_TRANSFER ? bankAccount : null,
                payment.getPaymentMethod() == Payment.PaymentMethod.BANK_TRANSFER ? bankName : null,
                null);
    }

    private String getQrDescription(Payment.PaymentMethod method) {
        switch (method) {
            case MOMO:
                return "Quét mã QR MoMo để thanh toán";
            case BANK_TRANSFER:
                return "Quét mã QR để chuyển khoản ngân hàng";
            case VNPAY:
                return "Quét mã QR để thanh toán qua VNPay";
            default:
                return "Thanh toán";
        }
    }

    @Override
    public PaymentResponse getBankTransferInfo(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Thanh toán", "orderId", orderId));

        return toResponse(payment, payment.getQrCodeUrl(),
                "Chuyển khoản ngân hàng - " + bankName,
                payment.getPaymentUrl(),
                bankAccount,
                bankName,
                null);
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
                .bankBranch(bankBranch)
                .qrDescription(qrDescription)
                .deeplink(deeplink)
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}

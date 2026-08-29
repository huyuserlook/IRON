package com.example.IRON.controller;

import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.entity.Order;
import com.example.IRON.entity.Payment;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.OrderRepository;
import com.example.IRON.repository.PaymentRepository;
import com.example.IRON.service.interfaces.OrderService;
import com.example.IRON.service.PayOSService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payos")
@RequiredArgsConstructor
public class PayOSController {

    private static final Logger log = LoggerFactory.getLogger(PayOSController.class);

    private final PayOSService payOSService;
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${payos.webhook.debug:false}")
    private boolean webhookDebug;

    @GetMapping("/return")
    public ResponseEntity<?> payosReturn(HttpServletRequest request) {
        Map<String, String> params = extractParams(request);

        String orderCode = params.get("orderCode");
        String status = params.get("status");
        String cancel = params.get("cancel");

        log.warn("[PayOS return] GET /api/payos/return. orderCode={}, status={}, cancel={}, allParams={}", orderCode, status, cancel, params);

        if (orderCode != null) {
            Order order = null;

            try {
                Long orderId = Long.parseLong(orderCode);
                order = orderRepository.findById(orderId).orElse(null);
                log.warn("[PayOS return] Lookup by numeric orderId={}: found={}", orderId, order != null);
            } catch (NumberFormatException e) {
                order = orderRepository.findByOrderCode(orderCode).orElse(null);
                log.warn("[PayOS return] Lookup by orderCode={}: found={}", orderCode, order != null);
            }

            if (order == null) {
                Payment paymentByPayosCode = paymentRepository.findByPayosOrderCode(orderCode).orElse(null);
                if (paymentByPayosCode != null) {
                    order = paymentByPayosCode.getOrder();
                    log.warn("[PayOS return] Lookup by payosOrderCode={}: found orderId={}", orderCode, order != null ? order.getId() : null);
                }
            }

            if (order != null) {
                Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
                log.warn("[PayOS return] Found payment: id={}, status={}", payment != null ? payment.getId() : null, payment != null ? payment.getStatus() : null);

                boolean isPaid = "PAID".equalsIgnoreCase(status);
                boolean isCancelled = "true".equalsIgnoreCase(cancel);

                if (payment != null && isPaid) {
                    payment.setStatus(Payment.PaymentStatus.PAID);
                    payment.setPaidAt(java.time.LocalDateTime.now());
                    paymentRepository.save(payment);
                    log.warn("[PayOS return] Payment UPDATED to PAID. paymentId={}, orderId={}", payment.getId(), order.getId());
                } else {
                    log.warn("[PayOS return] Payment update skipped: payment={}, isPaid={}", payment != null, isPaid);
                }

                if (isPaid && order.getStatus() == Order.OrderStatus.PENDING) {
                    log.warn("[PayOS return] Order update via OrderService to COMPLETED. orderId={}", order.getId());
                    orderService.updateStatus(order.getId(), Order.OrderStatus.COMPLETED);
                } else {
                    log.warn("[PayOS return] Order update skipped: orderStatus={}, isPaid={}", order.getStatus(), isPaid);
                }
            } else {
                log.warn("[PayOS return] Order NOT FOUND for orderCode={}", orderCode);
            }
        } else {
            log.warn("[PayOS return] No orderCode in request params");
        }

        String redirectUrl = frontendUrl + "/payment-return?orderCode=" + (orderCode != null ? orderCode : "") + "&status=" + (status != null ? status : "UNKNOWN");
        log.warn("[PayOS return] Redirecting to frontend: {}", redirectUrl);

        String html = "<html><head><meta charset=\"UTF-8\"><meta http-equiv=\"refresh\" content=\"0;url=" + redirectUrl + "\"/></head><body>Đang chuyển hướng...</body></html>";
        return ResponseEntity.ok(html);
    }

    /**
     * REMINDER: Mỗi lần restart ngrok, URL public sẽ đổi.
     * Cần cập nhật lại payos.return-url, payos.cancel-url, payos.webhook-url trong application.properties,
     * rồi cập nhật lại Webhook URL + Return URL trong PayOS Merchant Portal.
     * Hoặc đăng ký static domain ngrok để cố định URL.
     */
    @GetMapping("/check-status/{orderCode}")
    public ResponseEntity<?> checkPayOSStatus(@PathVariable String orderCode) {
        log.warn("[PayOS check-status] GET /api/payos/check-status/{}", orderCode);
        try {
            Map<String, Object> payosInfo = payOSService.getPaymentLinkInformation(orderCode);
            log.warn("[PayOS check-status] PayOS info for orderCode={}: {}", orderCode, payosInfo);

            String status = (String) payosInfo.get("status");
            String transactionId = (String) payosInfo.get("transactionId");
            String rawCode = (String) payosInfo.get("rawCode");

            if ("PAID".equalsIgnoreCase(status) || "00".equals(rawCode)) {
                Order order = null;
                Long parsedOrderId = null;
                try {
                    parsedOrderId = Long.parseLong(orderCode);
                    order = orderRepository.findById(parsedOrderId).orElse(null);
                } catch (NumberFormatException e) {
                    order = orderRepository.findByOrderCode(orderCode).orElse(null);
                }

                if (order == null) {
                    Payment paymentByPayosCode = paymentRepository.findByPayosOrderCode(orderCode).orElse(null);
                    if (paymentByPayosCode != null) {
                        order = paymentByPayosCode.getOrder();
                    }
                }

                if (order != null) {
                    Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
                    if (payment != null && payment.getStatus() != Payment.PaymentStatus.PAID) {
                        payment.setStatus(Payment.PaymentStatus.PAID);
                        payment.setTransactionId(transactionId);
                        payment.setPaidAt(java.time.LocalDateTime.now());
                        paymentRepository.save(payment);
                        log.warn("[PayOS check-status] Payment UPDATED to PAID via fallback. paymentId={}, orderId={}", payment.getId(), order.getId());
                    }

                    if (order.getStatus() == Order.OrderStatus.PENDING) {
                        log.warn("[PayOS check-status] Order update via OrderService to COMPLETED. orderId={}", order.getId());
                        orderService.updateStatus(order.getId(), Order.OrderStatus.COMPLETED);
                    }
                } else {
                    log.warn("[PayOS check-status] Order not found for orderCode={}", orderCode);
                }
            }

            return ResponseEntity.ok(ApiResponse.success(payosInfo));
        } catch (Exception e) {
            log.error("[PayOS check-status] Error checking status for orderCode={}", orderCode, e);
            return ResponseEntity.ok(ApiResponse.error("Không thể kiểm tra trạng thái PayOS: " + e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> payosWebhook(HttpServletRequest request) throws IOException {
        String body = new BufferedReader(new InputStreamReader(request.getInputStream()))
                .lines().collect(Collectors.joining("\n"));

        String signature = request.getHeader("x-signature");
        if (signature == null || signature.isBlank()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, Object> payload = objectMapper.readValue(body, Map.class);
                signature = (String) payload.get("signature");
            } catch (Exception e) {
                signature = null;
            }
        }

        log.warn("[PayOS webhook] RAW REQUEST BODY: {}", body);
        log.warn("[PayOS webhook] signature header={}", signature);

        if (webhookDebug) {
            log.warn("[PayOS webhook] DEBUG MODE ENABLED - bypassing signature verification");
        }

        com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
        Map<String, Object> payload = objectMapper.readValue(body, Map.class);

        try {
            payOSService.handleWebhook(payload, signature);
            log.warn("[PayOS webhook] Handler completed successfully");
            return ResponseEntity.ok(Map.of("code", "00", "desc", "Thành công"));
        } catch (SecurityException e) {
            log.error("[PayOS webhook] Signature verification FAILED: {}", e.getMessage());
            return ResponseEntity.status(400).body(Map.of("code", "97", "desc", "Chữ ký không hợp lệ"));
        } catch (Exception e) {
            log.error("[PayOS webhook] Handler error", e);
            return ResponseEntity.status(400).body(Map.of("code", "97", "desc", "Xử lý webhook thất bại: " + e.getMessage()));
        }
    }

    private Map<String, String> extractParams(HttpServletRequest request) {
        Map<String, String> params = new LinkedHashMap<>();
        Enumeration<String> paramNames = request.getParameterNames();
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            String paramValue = request.getParameter(paramName);
            params.put(paramName, paramValue);
        }
        return params;
    }
}

package com.example.IRON.controller;

import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.entity.Order;
import com.example.IRON.entity.Payment;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.OrderRepository;
import com.example.IRON.repository.PaymentRepository;
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

        log.info("[PayOS return] GET /api/payos/return. orderCode={}, status={}, cancel={}", orderCode, status, cancel);

        if (orderCode != null) {
            Order order = null;

            try {
                Long orderId = Long.parseLong(orderCode);
                order = orderRepository.findById(orderId).orElse(null);
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

                boolean isPaid = "PAID".equalsIgnoreCase(status);
                boolean isCancelled = "true".equalsIgnoreCase(cancel);

                if (payment != null && isPaid) {
                    payment.setStatus(Payment.PaymentStatus.PAID);
                    payment.setPaidAt(java.time.LocalDateTime.now());
                    paymentRepository.save(payment);
                    log.info("[PayOS return] Payment updated to PAID. paymentId={}, orderId={}", payment.getId(), order.getId());
                }

                if (isPaid && order.getStatus() == Order.OrderStatus.PENDING) {
                    order.setStatus(Order.OrderStatus.CONFIRMED);
                    orderRepository.save(order);
                    log.info("[PayOS return] Order updated to CONFIRMED. orderId={}", order.getId());
                } else {
                    log.info("[PayOS return] Order status={}, isPaid={}, skipping order update", order.getStatus(), isPaid);
                }
            } else {
                log.warn("[PayOS return] Order not found for orderCode={}", orderCode);
            }
        }

        log.info("[PayOS return] Redirecting to frontend: {}", frontendUrl + "/payment-return?orderCode=" + (orderCode != null ? orderCode : "") + "&status=" + (status != null ? status : "UNKNOWN"));

        String redirectUrl = frontendUrl + "/payment-return?orderCode=" + (orderCode != null ? orderCode : "") + "&status=" + (status != null ? status : "UNKNOWN");
        String html = "<html><head><meta charset=\"UTF-8\"><meta http-equiv=\"refresh\" content=\"0;url=" + redirectUrl + "\"/></head><body>Đang chuyển hướng...</body></html>";
        return ResponseEntity.ok(html);
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

        log.info("[PayOS webhook] Received POST /api/payos/webhook. signature={}", signature);
        log.info("[PayOS webhook] Raw body: {}", body);

        if (webhookDebug) {
            log.warn("[PayOS webhook] DEBUG MODE ENABLED - bypassing signature verification");
        }

        com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
        Map<String, Object> payload = objectMapper.readValue(body, Map.class);

        try {
            payOSService.handleWebhook(payload, signature);
            log.info("[PayOS webhook] Handler completed successfully");
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

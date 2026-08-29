package com.example.IRON.service;

import com.example.IRON.config.PayOSProperties;
import com.example.IRON.entity.Order;
import com.example.IRON.entity.Payment;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.DepositRepository;
import com.example.IRON.repository.OrderRepository;
import com.example.IRON.repository.PaymentRepository;
import com.example.IRON.service.interfaces.OrderService;
import com.example.IRON.utils.QrCodeUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PayOSService {

    private static final Logger log = LoggerFactory.getLogger(PayOSService.class);

    private final PayOSProperties payOSProperties;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final DepositRepository depositRepository;
    private final OrderService orderService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Value("${payos.webhook.debug:false}")
    private boolean webhookDebug;

    @Transactional
    public Map<String, Object> createPaymentLink(Long orderId, BigDecimal amount, String orderInfo) throws Exception {
        if (payOSProperties.getClientId() == null || payOSProperties.getApiKey() == null
                || payOSProperties.getChecksumKey() == null) {
            throw new IllegalStateException("PayOS chưa được cấu hình đầy đủ");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", orderId));

        long uniqueOrderCode = order.getId() * 1000000000L + (System.nanoTime() % 1000000000L);
        if (uniqueOrderCode <= 0 || uniqueOrderCode > 9007199254740991L) {
            uniqueOrderCode = Math.abs(order.getId() * 1000000000L + (System.nanoTime() % 1000000000L));
        }

        String orderCode = String.valueOf(uniqueOrderCode);
        String returnUrl = payOSProperties.getReturnUrl();
        if (returnUrl == null || returnUrl.isBlank()) {
            returnUrl = baseUrl + "/api/payos/return?orderId=" + order.getId();
        }
        String cancelUrl = payOSProperties.getCancelUrl();
        if (cancelUrl == null || cancelUrl.isBlank()) {
            cancelUrl = baseUrl + "/my-orders";
        }

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("orderCode", uniqueOrderCode);
        requestBody.put("amount", amount.intValue());
        requestBody.put("description", "Thanh toan don " + order.getId());
        requestBody.put("returnUrl", returnUrl);
        requestBody.put("cancelUrl", cancelUrl);

        String signature = createSignature(requestBody, payOSProperties.getChecksumKey());
        requestBody.put("signature", signature);

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(payOSProperties.getEndpoint()))
                .header("Content-Type", "application/json")
                .header("x-client-id", payOSProperties.getClientId())
                .header("x-api-key", payOSProperties.getApiKey())
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        String responseBody = response.body();
        JsonNode root = objectMapper.readTree(responseBody);

        String code = root.path("code").asText(null);
        if (!"00".equals(code)) {
            String desc = root.path("desc").asText("PayOS payment creation failed");
            String rawResponse = responseBody != null ? responseBody : "No response body";
            throw new RuntimeException("PayOS error: " + desc + " | Response: " + rawResponse);
        }

        JsonNode data = root.path("data");
        String checkoutUrl = data.path("checkoutUrl").asText(null);
        String qrCode = data.path("qrCode").asText(null);
        String paymentLinkId = data.path("paymentLinkId").asText(null);
        String qrCodeUrl = null;

        if (qrCode != null && !qrCode.isBlank()) {
            if (qrCode.startsWith("data:") || qrCode.startsWith("http")) {
                qrCodeUrl = qrCode;
            } else {
                try {
                    qrCodeUrl = "data:image/png;base64," + QrCodeUtils.generateQrCodeBase64(qrCode, 300, 300);
                } catch (Exception e) {
                    qrCodeUrl = null;
                }
            }
        }

        if (checkoutUrl == null && paymentLinkId != null && !paymentLinkId.isBlank()) {
            checkoutUrl = "https://pay.payos.vn/web/" + paymentLinkId;
        }

        if (qrCodeUrl == null || qrCodeUrl.isBlank()) {
            if (checkoutUrl != null) {
                try {
                    String generatedQr = QrCodeUtils.generateQrCodeBase64(checkoutUrl, 300, 300);
                    qrCodeUrl = "data:image/png;base64," + generatedQr;
                } catch (Exception e) {
                    qrCodeUrl = null;
                }
            }
        }

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        if (payment != null) {
            payment.setPaymentUrl(checkoutUrl);
            payment.setQrCodeUrl(qrCodeUrl);
            payment.setPayosOrderCode(orderCode);
            paymentRepository.save(payment);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("checkoutUrl", checkoutUrl);
        result.put("qrCodeUrl", qrCodeUrl);
        result.put("qrCode", qrCode);
        result.put("paymentLinkId", paymentLinkId);
        result.put("orderId", orderId);
        result.put("orderCode", orderCode);
        result.put("amount", amount.intValue());
        return result;
    }

    /**
     * REMINDER: Mỗi lần restart ngrok, URL public sẽ đổi.
     * Cần cập nhật lại các URL sau trong application.properties:
     *   - payos.return-url
     *   - payos.cancel-url
     *   - payos.webhook-url
     * Sau đó restart backend và cập nhật lại trong PayOS Merchant Portal.
     * Nếu không muốn lặp lại, đăng ký static domain ngrok để cố định URL.
     */
    @Transactional
    public Map<String, Object> getPaymentLinkInformation(String orderCode) throws Exception {
        log.warn("[PayOS check-status] Querying PayOS for orderCode={}", orderCode);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("orderCode", orderCode);

        String signature = createSignature(requestBody, payOSProperties.getChecksumKey());
        requestBody.put("signature", signature);

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(payOSProperties.getEndpoint() + "/" + orderCode))
                .header("Content-Type", "application/json")
                .header("x-client-id", payOSProperties.getClientId())
                .header("x-api-key", payOSProperties.getApiKey())
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        String responseBody = response.body();
        JsonNode root = objectMapper.readTree(responseBody);

        log.warn("[PayOS check-status] PayOS response: code={}, body={}", root.path("code").asText(null), responseBody);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("rawCode", root.path("code").asText(null));
        result.put("rawDesc", root.path("desc").asText(null));

        JsonNode data = root.path("data");
        result.put("status", data.path("status").asText(null));
        result.put("transactionId", data.path("reference").asText(null));
        result.put("paidAmount", data.path("amount").asText(null));

        if (data.has("orderCode")) {
            result.put("orderCode", data.path("orderCode").asText(null));
        }

        return result;
    }

    public boolean verifyWebhookSignature(Map<String, Object> data, String signature) {
        if (signature == null || signature.isBlank()) {
            log.warn("[PayOS webhook] Missing signature");
            return false;
        }
        try {
            String expected = createSignatureFromObject(data, payOSProperties.getChecksumKey());
            boolean match = expected.equalsIgnoreCase(signature);
            if (!match) {
                log.warn("[PayOS webhook] Signature mismatch. expected={}, actual={}", expected, signature);
            }
            return match;
        } catch (Exception e) {
            log.error("[PayOS webhook] Signature computation error", e);
            return false;
        }
    }

    @Transactional
    public void handleWebhook(Map<String, Object> data, String signature) {
        log.warn("[PayOS webhook] ========== WEBHOOK RECEIVED ==========");
        log.warn("[PayOS webhook] Full payload data={}", data);
        log.warn("[PayOS webhook] signature={}", signature);

        Map<String, Object> innerData = (Map<String, Object>) data.get("data");
        if (innerData == null) {
            innerData = data;
        }

        log.warn("[PayOS webhook] innerData={}", innerData);
        log.warn("[PayOS webhook] innerData orderCode={}, code={}", innerData.get("orderCode"), innerData.get("code"));

        if (!webhookDebug) {
            if (!verifyWebhookSignature(innerData, signature)) {
                log.error("[PayOS webhook] Signature verification FAILED - rejecting webhook");
                throw new SecurityException("Invalid PayOS webhook signature");
            }
            log.warn("[PayOS webhook] Signature verified OK");
        } else {
            log.warn("[PayOS webhook] DEBUG MODE - skipping signature verification");
        }

        Object orderCodeObj = innerData.get("orderCode");
        String orderCode = orderCodeObj != null ? String.valueOf(orderCodeObj) : null;
        String reference = String.valueOf(innerData.getOrDefault("reference", ""));
        String code = String.valueOf(innerData.getOrDefault("code", ""));

        log.warn("[PayOS webhook] Parsed orderCode={}, reference={}, code={}", orderCode, reference, code);

        if (orderCode == null || !"00".equals(code)) {
            log.warn("[PayOS webhook] Skipping: orderCode={}, code={}", orderCode, code);
            return;
        }

        Order order = null;
        Long parsedOrderId = null;
        try {
            parsedOrderId = Long.parseLong(orderCode);
            order = orderRepository.findById(parsedOrderId).orElse(null);
            log.warn("[PayOS webhook] Lookup by orderId={}: found={}", parsedOrderId, order != null);
        } catch (NumberFormatException e) {
            log.warn("[PayOS webhook] orderCode is not numeric, trying orderCode/payosOrderCode lookup");
        }

        if (order == null) {
            order = orderRepository.findByOrderCode(orderCode).orElse(null);
            log.warn("[PayOS webhook] Lookup by orderCode={}: found={}", orderCode, order != null);
        }

        if (order == null) {
            Payment paymentByPayosCode = paymentRepository.findByPayosOrderCode(orderCode).orElse(null);
            if (paymentByPayosCode != null) {
                order = paymentByPayosCode.getOrder();
                log.warn("[PayOS webhook] Lookup by payosOrderCode={}: found orderId={}", orderCode, order != null ? order.getId() : null);
            } else {
                log.error("[PayOS webhook] ORDER NOT FOUND by any method for orderCode={}", orderCode);
            }
        }

        if (order == null) {
            log.error("[PayOS webhook] ABORTING - order not found for orderCode={}", orderCode);
            return;
        }

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        if (payment == null) {
            log.error("[PayOS webhook] ABORTING - payment not found for orderId={}", order.getId());
            return;
        }

        log.warn("[PayOS webhook] Before update: paymentId={}, paymentStatus={}, orderStatus={}",
                payment.getId(), payment.getStatus(), order.getStatus());

        if (payment.getStatus() != Payment.PaymentStatus.PAID) {
            payment.setStatus(Payment.PaymentStatus.PAID);
            payment.setTransactionId(reference);
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);
            log.warn("[PayOS webhook] Payment UPDATED to PAID. paymentId={}, reference={}", payment.getId(), reference);
        } else {
            log.warn("[PayOS webhook] Payment already PAID, skipping. paymentId={}", payment.getId());
        }

        if (order.getStatus() == Order.OrderStatus.PENDING) {
            log.warn("[PayOS webhook] Order update via OrderService to COMPLETED. orderId={}", order.getId());
            orderService.updateStatus(order.getId(), Order.OrderStatus.COMPLETED);
        } else if (order.getStatus() == Order.OrderStatus.DEPOSITED) {
            log.warn("[PayOS webhook] Deposit payment confirmed. orderId={}", order.getId());
            depositRepository.findByOrderId(order.getId()).ifPresent(deposit -> {
                if (deposit.getStatus() != com.example.IRON.entity.Deposit.DepositStatus.DEPOSITED) {
                    deposit.setStatus(com.example.IRON.entity.Deposit.DepositStatus.DEPOSITED);
                    depositRepository.save(deposit);
                    log.warn("[PayOS webhook] Deposit UPDATED to DEPOSITED. depositId={}", deposit.getId());
                } else {
                    log.warn("[PayOS webhook] Deposit already DEPOSITED, skipping. depositId={}", deposit.getId());
                }
            });
        } else {
            log.warn("[PayOS webhook] Order status={}, skipping order/deposit update", order.getStatus());
        }

        log.warn("[PayOS webhook] ========== PROCESSING COMPLETE ==========");
    }

    private String createSignature(Map<String, Object> body, String checksumKey) throws Exception {
        List<String> fields = Arrays.asList("amount", "cancelUrl", "description", "orderCode", "returnUrl");
        List<String> sortedKeys = new ArrayList<>(fields);
        Collections.sort(sortedKeys);

        StringBuilder raw = new StringBuilder();
        for (String field : sortedKeys) {
            Object value = body.get(field);
            if (value != null) {
                if (raw.length() > 0) raw.append("&");
                raw.append(field).append("=").append(value);
            }
        }

        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(checksumKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        byte[] hash = sha256_HMAC.doFinal(raw.toString().getBytes(StandardCharsets.UTF_8));
        return bytesToHex(hash);
    }

    private String createSignatureFromObject(Map<String, Object> data, String checksumKey) throws Exception {
        List<String> sortedKeys = new ArrayList<>(data.keySet());
        Collections.sort(sortedKeys);

        StringBuilder raw = new StringBuilder();
        for (String key : sortedKeys) {
            Object value = data.get(key);
            if (value != null && !"signature".equalsIgnoreCase(key)) {
                if (raw.length() > 0) raw.append("&");
                raw.append(key).append("=").append(value);
            }
        }

        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(checksumKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        byte[] hash = sha256_HMAC.doFinal(raw.toString().getBytes(StandardCharsets.UTF_8));
        return bytesToHex(hash);
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}

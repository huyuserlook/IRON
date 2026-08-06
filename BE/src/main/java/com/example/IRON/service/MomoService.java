package com.example.IRON.service;

import com.example.IRON.config.MomoProperties;
import com.example.IRON.entity.Order;
import com.example.IRON.entity.Payment;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.OrderRepository;
import com.example.IRON.repository.PaymentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MomoService {

    private final MomoProperties momoProperties;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Transactional
    public Map<String, Object> createPayment(String orderId, BigDecimal amount, String orderInfo) throws Exception {
        if (momoProperties.getPartnerCode() == null || momoProperties.getAccessKey() == null
                || momoProperties.getSecretKey() == null || momoProperties.getEndpoint() == null) {
            throw new IllegalStateException("MoMo chưa được cấu hình đầy đủ");
        }

        Order order = orderRepository.findById(Long.parseLong(orderId))
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", orderId));

        String momoOrderId = order.getOrderCode();
        String requestId = momoOrderId + "_" + System.currentTimeMillis();
        String ipnUrl = momoProperties.getIpnUrl();
        String redirectUrl = momoProperties.getRedirectUrl();
        if (redirectUrl == null || redirectUrl.isBlank()) {
            redirectUrl = baseUrl + "/my-orders";
        }
        if (ipnUrl == null || ipnUrl.isBlank()) {
            ipnUrl = baseUrl + "/api/webhook/momo";
        }

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("partnerCode", momoProperties.getPartnerCode());
        requestBody.put("accessKey", momoProperties.getAccessKey());
        requestBody.put("requestId", requestId);
        requestBody.put("amount", amount.intValue());
        requestBody.put("orderId", momoOrderId);
        requestBody.put("orderInfo", orderInfo);
        requestBody.put("redirectUrl", redirectUrl);
        requestBody.put("ipnUrl", ipnUrl);
        requestBody.put("extraData", "");
        requestBody.put("requestType", momoProperties.getRequestType());
        requestBody.put("lang", "vi");

        String rawSignature = buildSignature(requestBody);
        String signature = hmacSHA256(rawSignature, momoProperties.getSecretKey());
        requestBody.put("signature", signature);

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(momoProperties.getEndpoint()))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        String responseBody = response.body();
        JsonNode root = objectMapper.readTree(responseBody);

        int resultCode = root.path("resultCode").asInt();
        if (resultCode != 0) {
            String message = root.path("message").asText("MoMo payment creation failed");
            throw new RuntimeException("MoMo error: " + message + " (resultCode=" + resultCode + ")");
        }

        String qrCodeUrl = root.path("qrCodeUrl").asText(null);
        String payUrl = root.path("payUrl").asText(null);
        String deeplink = root.path("deeplink").asText(null);

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        if (payment != null) {
            payment.setQrCodeUrl(qrCodeUrl);
            payment.setPaymentUrl(payUrl);
            paymentRepository.save(payment);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("qrCodeUrl", qrCodeUrl);
        result.put("payUrl", payUrl);
        result.put("deeplink", deeplink);
        result.put("orderId", orderId);
        result.put("requestId", requestId);
        result.put("amount", amount.intValue());
        return result;
    }

    public boolean verifySignature(Map<String, String> params, String secretKey) {
        String signature = params.get("signature");
        if (signature == null || signature.isBlank()) {
            return false;
        }

        Map<String, String> filtered = params.entrySet().stream()
                .filter(e -> !"signature".equalsIgnoreCase(e.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        StringBuilder raw = new StringBuilder();
        filtered.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(e -> {
                    if (raw.length() > 0) raw.append("&");
                    raw.append(e.getKey()).append("=").append(e.getValue());
                });

        try {
            String expected = hmacSHA256(raw.toString(), secretKey);
            return expected.equalsIgnoreCase(signature);
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public void handleWebhook(Map<String, String> params) {
        String secretKey = momoProperties.getSecretKey();
        if (!verifySignature(params, secretKey)) {
            throw new SecurityException("Invalid MoMo webhook signature");
        }

        String resultCode = params.get("resultCode");
        String orderId = params.get("orderId");
        String transId = params.get("transId");

        if (!"0".equals(resultCode) || orderId == null) {
            return;
        }

        Order order = orderRepository.findByOrderCode(orderId)
                .orElse(null);
        if (order == null) return;

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);
        if (payment == null) return;

        if (payment.getStatus() != Payment.PaymentStatus.PAID) {
            payment.setStatus(Payment.PaymentStatus.PAID);
            payment.setTransactionId(transId);
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);
        }

        if (order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
            orderRepository.save(order);
        }
    }

    private String buildSignature(Map<String, Object> body) {
        List<String> fields = Arrays.asList(
                "accessKey", "amount", "extraData", "ipnUrl", "orderId",
                "orderInfo", "partnerCode", "redirectUrl", "requestId", "requestType"
        );

        StringBuilder raw = new StringBuilder();
        for (String field : fields) {
            Object value = body.get(field);
            if (value != null) {
                if (raw.length() > 0) raw.append("&");
                raw.append(field).append("=").append(value);
            }
        }
        return raw.toString();
    }

    private String hmacSHA256(String data, String key) throws Exception {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getEncoder().encodeToString(hash);
    }
}

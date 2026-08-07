package com.example.IRON.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.Getter;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;

@Service
@Getter
@Setter
@ConfigurationProperties(prefix = "esms")
public class EsmsService {

    @Value("${esms.api-key}")
    private String apiKey;

    @Value("${esms.secret-key}")
    private String secretKey;

    @Value("${esms.brand-name:IRON}")
    private String brandName;

    @Value("${esms.enabled:false}")
    private boolean enabled;

    private static final String SEND_URL = "https://api.esms.vn/MainService.svc/json/SendMessage_V4_post";

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOtp(String toPhone, String otp) {
        if (!enabled || apiKey == null || apiKey.isBlank() || secretKey == null || secretKey.isBlank()) {
            System.out.println("ESMS OTP for " + toPhone + ": " + otp);
            return;
        }

        try {
            Map<String, Object> body = new HashMap<>();
            body.put("ApiKey", apiKey);
            body.put("SecretKey", secretKey);
            body.put("Phone", toPhone);
            body.put("Content", "Ma OTP Iron Moto cua ban la: " + otp + ". Ma co hieu luc trong 15 phut.");
            body.put("Sender", brandName);
            body.put("BrandId", 43);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(SEND_URL, request, String.class);
            if (!response.getStatusCode().is2xxSuccessful()) {
                System.out.println("ESMS FAILED for " + toPhone + ": " + response.getBody());
                System.out.println("OTP FALLBACK for " + toPhone + ": " + otp);
            }
        } catch (Exception ex) {
            System.out.println("ESMS FAILED for " + toPhone + ": " + ex.getMessage());
            System.out.println("OTP FALLBACK for " + toPhone + ": " + otp);
        }
    }
}

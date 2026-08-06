package com.example.IRON.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "vnpay")
public class VnpayProperties {
    private String tmnCode;
    private String hashSecret;
    private String paymentUrl;
    private String returnUrl;
    private String apiUrl;
    private String version = "2.1.0";
    private String locale = "vn";
    private String currency = "VND";
}
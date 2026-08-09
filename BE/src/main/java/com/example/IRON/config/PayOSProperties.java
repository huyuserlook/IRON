package com.example.IRON.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "payos")
public class PayOSProperties {
    private String clientId;
    private String apiKey;
    private String checksumKey;
    private String endpoint = "https://api-merchant.payos.vn/v2/payment-requests";
    private String webhookUrl;
    private String returnUrl;
    private String cancelUrl;
}

package com.example.IRON.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "momo")
public class MomoProperties {
    private String partnerCode;
    private String accessKey;
    private String secretKey;
    private String endpoint;
    private String ipnUrl;
    private String requestType = "captureWallet";
    private String redirectUrl;
}

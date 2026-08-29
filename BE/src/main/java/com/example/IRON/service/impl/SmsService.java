package com.example.IRON.service.impl;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Service;

@Service
@Getter
@Setter
@ConfigurationProperties(prefix = "twilio")
public class SmsService {
    private String accountSid;
    private String authToken;
    private String phoneNumber;
    private boolean enabled = false;

    public void sendOtp(String toPhone, String otp) {
        if (!enabled || accountSid == null || accountSid.startsWith("your_")) {
            System.out.println("SMS OTP for " + toPhone + ": " + otp);
            return;
        }

        try {
            Twilio.init(accountSid, authToken);
            Message.creator(
                new PhoneNumber(toPhone),
                new PhoneNumber(phoneNumber),
                "Ma OTP Iron Moto cua ban la: " + otp + ". Ma co hieu luc trong 15 phut."
            ).create();
        } catch (Exception ex) {
            System.out.println("SMS FAILED for " + toPhone + ": " + ex.getMessage());
            System.out.println("OTP FALLBACK for " + toPhone + ": " + otp);
        }
    }
}

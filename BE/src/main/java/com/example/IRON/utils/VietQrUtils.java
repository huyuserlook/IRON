package com.example.IRON.utils;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class VietQrUtils {

    public static String generateVietQrUrl(String bankCode, String accountNo, String accountName, BigDecimal amount, Long orderId) {
        try {
            String encodedAccountName = URLEncoder.encode(accountName, StandardCharsets.UTF_8.toString());
            String noiDung = "DH" + orderId;
            String encodedNoiDung = URLEncoder.encode(noiDung, StandardCharsets.UTF_8.toString());
            return String.format(
                    "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                    bankCode, accountNo, amount.longValue(), encodedNoiDung, encodedAccountName
            );
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException("Loi encoding VietQR URL", e);
        }
    }
}

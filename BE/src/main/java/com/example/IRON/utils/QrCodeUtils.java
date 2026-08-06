package com.example.IRON.utils;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

public class QrCodeUtils {

    public static String generateQrCodeBase64(String text, int width, int height) throws IOException, WriterException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        Map<com.google.zxing.EncodeHintType, Object> hints = new HashMap<>();
        hints.put(com.google.zxing.EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.M);
        hints.put(com.google.zxing.EncodeHintType.CHARACTER_SET, "UTF-8");

        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        byte[] pngData = pngOutputStream.toByteArray();

        return Base64.getEncoder().encodeToString(pngData);
    }

    public static String generateQrCodeBase64(String text) throws IOException, WriterException {
        return generateQrCodeBase64(text, 300, 300);
    }

    public static String moMoQrData(String phone, String amount, String orderId, String description) {
        return String.format("moqpay://pay?phone=%s&amount=%s&orderId=%s&desc=%s",
                phone, amount, orderId, description);
    }

    public static String vnpayPaymentUrl(String vnpayBaseUrl, String vnpTmnCode, String vnpTxnRef,
                                         String amount, String orderInfo, String returnUrl) {
        return String.format("%s?vnptmncode=%s&vnp_txnref=%s&vnp_amount=%s&vnp_orderinfo=%s&vnp_returndurl=%s&vnp_command=pay&vnp_version=2.1.0&vnp_locale=vn&vnp_currency=VND",
                vnpayBaseUrl, vnpTmnCode, vnpTxnRef, amount, orderInfo, returnUrl);
    }

    public static String bankQrData(String accountNumber, String bankName, String amount, String ownerName) {
        return String.format("vnpay://qr?acct=%s&bank=%s&amt=%s&name=%s",
                accountNumber, bankName, amount, ownerName);
    }
}
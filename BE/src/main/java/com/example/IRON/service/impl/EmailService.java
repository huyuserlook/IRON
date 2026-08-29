package com.example.IRON.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean enabled;

    @Value("${app.mail.from:}")
    private String from;

    public void sendDepositCreated(String toEmail, String fullName, String orderCode, String depositAmount, String remainingAmount, String deadlineDate) {
        if (!enabled || mailSender == null || from == null || from.isBlank()) {
            System.out.println("[EMAIL][DEPOSIT_CREATED] To=" + toEmail + " | Order=" + orderCode + " | Deposit=" + depositAmount + " | Remaining=" + remainingAmount + " | Deadline=" + deadlineDate);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(toEmail);
            message.setSubject("Đặt cọc giữ xe thành công - Đơn " + orderCode);
            message.setText(
                    "Kính gửi " + fullName + ",\n\n" +
                    "Bạn đã đặt cọc thành công cho đơn hàng " + orderCode + ".\n" +
                    "- Số tiền đặt cọc: " + depositAmount + " VND\n" +
                    "- Số tiền còn lại: " + remainingAmount + " VND\n" +
                    "- Hạn thanh toán nốt: " + deadlineDate + "\n\n" +
                    "Vui lòng hoàn tất thanh toán trước hạn để nhận xe.\n" +
                    "Trân trọng,\nIRON Showroom"
            );
            mailSender.send(message);
        } catch (Exception ex) {
            System.out.println("[EMAIL][DEPOSIT_CREATED][FAILED] To=" + toEmail + " | Error=" + ex.getMessage());
        }
    }

    public void sendDepositExpired(String toEmail, String fullName, String orderCode) {
        if (!enabled || mailSender == null || from == null || from.isBlank()) {
            System.out.println("[EMAIL][DEPOSIT_EXPIRED] To=" + toEmail + " | Order=" + orderCode);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(toEmail);
            message.setSubject("Đơn đặt cọc đã hủy do quá hạn - " + orderCode);
            message.setText(
                    "Kính gửi " + fullName + ",\n\n" +
                    "Đơn hàng " + orderCode + " của bạn đã bị hủy do quá hạn thanh toán.\n" +
                    "Nếu bạn vẫn quan tâm, vui lòng liên hệ showroom để được hỗ trợ.\n\n" +
                    "Trân trọng,\nIRON Showroom"
            );
            mailSender.send(message);
        } catch (Exception ex) {
            System.out.println("[EMAIL][DEPOSIT_EXPIRED][FAILED] To=" + toEmail + " | Error=" + ex.getMessage());
        }
    }
}

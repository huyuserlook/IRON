package com.example.IRON.dto.response;

import com.example.IRON.entity.Order;
import com.example.IRON.entity.Payment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderCode;
    private String customerName;
    private String customerEmail;
    private BigDecimal totalAmount;
    private Order.OrderStatus status;
    private String shippingAddress;
    private String customerNote;
    private Payment.PaymentMethod paymentMethod;
    private Payment.PaymentStatus paymentStatus;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long motorcycleId;
        private String motorcycleName;
        private String colorName;
        private String thumbnailUrl;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}

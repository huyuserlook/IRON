package com.example.IRON.dto.request;

import com.example.IRON.entity.Payment;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class OrderRequest {
    @NotEmpty(message = "Giỏ hàng không được để trống")
    private List<OrderItemRequest> items;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String shippingAddress;

    private Payment.PaymentMethod paymentMethod;
    private String customerNote;

    @Data
    public static class OrderItemRequest {
        private Long motorcycleId;
        private String colorName;
        private Integer quantity;
    }
}
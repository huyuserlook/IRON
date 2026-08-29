package com.example.IRON.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentMethodRequest {

    @NotBlank(message = "Tên phương thức thanh toán là bắt buộc")
    private String name;

    @NotBlank(message = "Mã phương thức thanh toán là bắt buộc")
    private String code;

    private String description;

    private String iconUrl;

    @NotNull(message = "Trạng thái hoạt động là bắt buộc")
    private Boolean active = true;

    private Integer sortOrder = 0;
}
package com.example.IRON.dto.request;

import lombok.Data;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
public class ReviewRequest {
    @NotNull(message = "Motorcycle id không được để trống")
    private Long motorcycleId;

    @Size(max = 100, message = "Tên khách hàng không quá 100 ký tự")
    private String customerName;

    @Size(max = 150, message = "Email không quá 150 ký tự")
    private String customerEmail;

    @NotNull(message = "Đánh giá sao là bắt buộc")
    @Min(value = 1, message = "Đánh giá phải lớn hơn hoặc bằng 1")
    @Max(value = 5, message = "Đánh giá phải nhỏ hơn hoặc bằng 5")
    private Integer rating;

    @NotNull(message = "Nội dung đánh giá không được để trống")
    @Size(max = 1000, message = "Nội dung đánh giá không quá 1000 ký tự")
    private String comment;
}

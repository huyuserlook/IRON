package com.example.IRON.dto.request;

import com.example.IRON.entity.Motorcycle;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MotorcycleRequest {
    @NotBlank(message = "Tên xe không được để trống")
    private String name;

    @NotNull(message = "Hãng xe không được để trống")
    private Long brandId;

    @NotNull(message = "Dòng xe không được để trống")
    private Long categoryId;

    @NotNull @Positive(message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    private Integer engineCc;
    private Double horsepower;
    private Double torque;
    private Integer yearModel;
    private String thumbnailUrl;
    private String description;
    private String specifications;
    private Motorcycle.MotorcycleStatus status;
    private Boolean featured;
}
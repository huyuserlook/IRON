package com.example.IRON.dto.request;

import com.example.IRON.entity.Motorcycle;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

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

    @DecimalMin(value = "0", message = "Giá vốn không được âm")
    private BigDecimal costPrice;

    private Integer engineCc;
    private Double horsepower;
    private Double torque;
    private Integer yearModel;
    private String thumbnailUrl;
    private Integer stock;
    private String description;
    private String specifications;
    private Motorcycle.MotorcycleStatus status;
    private Boolean featured;

    /** Danh sách ảnh (base64/data-url hoặc URL) */
    private List<String> images = new ArrayList<>();

    /** Danh sách tồn kho theo màu */
    private List<InventoryItem> inventories = new ArrayList<>();

    @Data
    public static class InventoryItem {
        private String colorName;
        private String colorCode;
        private Integer quantity;
    }
}

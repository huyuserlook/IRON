package com.example.IRON.dto.response;

import com.example.IRON.dto.response.ReviewResponse;
import com.example.IRON.entity.Motorcycle;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MotorcycleDetailResponse {
    private Long id;
    private String name;
    private String slug;
    private BrandResponse brand;
    private CategoryResponse category;
    private BigDecimal price;
    private BigDecimal costPrice;
    private Integer engineCc;
    private Double horsepower;
    private Double torque;
    private Integer yearModel;
    private String thumbnailUrl;
    private String description;
    private String specifications;
    private Motorcycle.MotorcycleStatus status;
    private Boolean featured;
    private Integer stock;
    private List<ImageResponse> images;
    private List<InventoryResponse> inventories;
    private List<ReviewResponse> reviews;
    private LocalDateTime createdAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ImageResponse {
        private Long id;
        private String imageUrl;
        private String colorName;
        private Integer sortOrder;
        private Boolean isPrimary;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class InventoryResponse {
        private Long id;
        private String colorName;
        private String colorCode;
        private Integer quantity;
    }
}
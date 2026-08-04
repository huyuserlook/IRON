package com.example.IRON.dto.response;

import com.example.IRON.entity.Motorcycle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MotorcycleResponse {
    private Long id;
    private String name;
    private String slug;
    private String brandName;
    private String categoryName;
    private BigDecimal price;
    private Integer engineCc;
    private String thumbnailUrl;
    private Motorcycle.MotorcycleStatus status;
    private Boolean featured;
    /** Tổng số lượng tồn kho của tất cả màu */
    private Integer totalInventory;
}


package com.example.IRON.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Ten dong xe khong duoc de trong")
    private String name;

    private String description;
    private String imageUrl;
    private Boolean active;
}

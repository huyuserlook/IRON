package com.example.IRON.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BrandRequest {
    @NotBlank(message = "Ten hang xe khong duoc de trong")
    private String name;

    private String logoUrl;
    private String description;
    private Boolean active;
}

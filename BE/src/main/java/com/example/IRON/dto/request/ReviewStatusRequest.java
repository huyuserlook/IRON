package com.example.IRON.dto.request;

import com.example.IRON.entity.Review;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewStatusRequest {
    @NotNull(message = "Trạng thái review không được để trống")
    private Review.ReviewStatus status;
}

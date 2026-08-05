package com.example.IRON.dto.response;

import com.example.IRON.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private Long userId;
    private Long motorcycleId;
    private String motorcycleName;
    private String customerName;
    private String customerEmail;
    private String title;
    private Integer rating;
    private String comment;
    private String imageUrl;
    private Review.ReviewStatus status;
    private LocalDateTime createdAt;
}

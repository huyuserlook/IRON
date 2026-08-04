package com.example.IRON.controller;

import com.example.IRON.dto.request.ReviewRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.dto.response.ReviewResponse;
import com.example.IRON.service.interfaces.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> create(@RequestBody @Valid ReviewRequest request) {
        ReviewResponse res = reviewService.create(request);
        return ResponseEntity.ok(ApiResponse.success(res, "Gửi đánh giá thành công"));
    }
}

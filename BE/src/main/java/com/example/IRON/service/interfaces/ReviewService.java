package com.example.IRON.service.interfaces;

import com.example.IRON.dto.request.ReviewRequest;
import com.example.IRON.dto.request.ReviewStatusRequest;
import com.example.IRON.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    Page<ReviewResponse> search(String keyword, String status, Pageable pageable);
    ReviewResponse getById(Long id);
    ReviewResponse approve(Long id, ReviewStatusRequest request);
    void delete(Long id);
    ReviewResponse create(ReviewRequest request);
}

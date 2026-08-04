package com.example.IRON.service.impl;

import com.example.IRON.dto.request.ReviewRequest;
import com.example.IRON.dto.request.ReviewStatusRequest;
import com.example.IRON.dto.response.ReviewResponse;
import com.example.IRON.entity.Motorcycle;
import com.example.IRON.entity.Review;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.MotorcycleRepository;
import com.example.IRON.repository.ReviewRepository;
import com.example.IRON.service.interfaces.ReviewService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final MotorcycleRepository motorcycleRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             MotorcycleRepository motorcycleRepository) {
        this.reviewRepository = reviewRepository;
        this.motorcycleRepository = motorcycleRepository;
    }

    @Override
    public Page<ReviewResponse> search(String keyword, String status, Pageable pageable) {
        Review.ReviewStatus reviewStatus = null;
        if (status != null && !status.isBlank()) {
            reviewStatus = Review.ReviewStatus.valueOf(status);
        }
        return reviewRepository.searchReviews(keyword, reviewStatus, pageable)
                .map(this::toResponse);
    }

    @Override
    public ReviewResponse getById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        return toResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse approve(Long id, ReviewStatusRequest request) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        review.setStatus(request.getStatus());
        return toResponse(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        reviewRepository.delete(review);
    }

    @Override
    @Transactional
    public ReviewResponse create(ReviewRequest request) {
        Motorcycle motorcycle = motorcycleRepository.findById(request.getMotorcycleId())
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle", "id", request.getMotorcycleId()));

        Review review = new Review();
        review.setMotorcycle(motorcycle);
        review.setCustomerName(request.getCustomerName());
        review.setCustomerEmail(request.getCustomerEmail());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setStatus(Review.ReviewStatus.PENDING);

        return toResponse(reviewRepository.save(review));
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .motorcycleId(review.getMotorcycle().getId())
                .motorcycleName(review.getMotorcycle().getName())
                .customerName(review.getCustomerName())
                .customerEmail(review.getCustomerEmail())
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

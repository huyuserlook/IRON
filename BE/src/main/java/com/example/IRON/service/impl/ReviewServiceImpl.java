package com.example.IRON.service.impl;

import com.example.IRON.dto.request.ReviewRequest;
import com.example.IRON.dto.request.ReviewStatusRequest;
import com.example.IRON.dto.response.ReviewResponse;
import com.example.IRON.entity.Motorcycle;
import com.example.IRON.entity.Review;
import com.example.IRON.entity.User;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.exception.UnauthorizedException;
import com.example.IRON.repository.MotorcycleRepository;
import com.example.IRON.repository.ReviewRepository;
import com.example.IRON.repository.UserRepository;
import com.example.IRON.service.interfaces.ReviewService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final MotorcycleRepository motorcycleRepository;
    private final UserRepository userRepository;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
                             MotorcycleRepository motorcycleRepository,
                             UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.motorcycleRepository = motorcycleRepository;
        this.userRepository = userRepository;
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

        // Lấy user đang đăng nhập từ JWT (required because user_id is NOT NULL)
        User user = getCurrentUser();

        Review review = new Review();
        review.setMotorcycle(motorcycle);
        review.setUser(user);
        review.setCustomerName(
                (request.getCustomerName() == null || request.getCustomerName().isBlank())
                        ? user.getFullName()
                        : request.getCustomerName());
        review.setCustomerEmail(
                (request.getCustomerEmail() == null || request.getCustomerEmail().isBlank())
                        ? user.getEmail()
                        : request.getCustomerEmail());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setImageUrl(request.getImageBase64());
        // Hiển thị ngay lập tức, không cần duyệt
        review.setStatus(Review.ReviewStatus.APPROVED);

        return toResponse(reviewRepository.save(review));
    }

    @Override
    public long countNewReviews() {
        return reviewRepository.countNewReviews(LocalDateTime.now().minusDays(1));
    }

    @Override
    public List<ReviewResponse> getNewReviews(int limit) {
        return reviewRepository.findNewReviews(
                        LocalDateTime.now().minusDays(1),
                        PageRequest.of(0, limit))
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Bạn cần đăng nhập để gửi đánh giá");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .motorcycleId(review.getMotorcycle().getId())
                .motorcycleName(review.getMotorcycle().getName())
                .customerName(review.getCustomerName())
                .customerEmail(review.getCustomerEmail())
                .rating(review.getRating())
                .comment(review.getComment())
                .imageUrl(review.getImageUrl())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

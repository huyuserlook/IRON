package com.example.IRON.controller.admin;

import com.example.IRON.dto.request.ReviewRequest;
import com.example.IRON.dto.request.ReviewStatusRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.dto.response.ReviewResponse;
import com.example.IRON.service.interfaces.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminReviewController {

private final ReviewService reviewService;

    @GetMapping("/new-count")
    public ResponseEntity<ApiResponse<?>> getNewCount() {
        return ResponseEntity.ok(ApiResponse.success(reviewService.countNewReviews()));
    }

    @GetMapping("/new")
    public ResponseEntity<ApiResponse<?>> getNewReviews(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getNewReviews(limit)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(ApiResponse.success(
                reviewService.search(keyword, status, PageRequest.of(page, size, sort))));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<?>> updateStatus(
            @PathVariable Long id,
            @RequestBody @Valid ReviewStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.approve(id, request), "Cập nhật trạng thái đánh giá thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        reviewService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa đánh giá thành công"));
    }
}

package com.example.IRON.controller;

import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.entity.Motorcycle;
import com.example.IRON.service.interfaces.MotorcycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/motorcycles")
@RequiredArgsConstructor
public class MotorcycleController {

    private final MotorcycleService motorcycleService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> search(
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Motorcycle.MotorcycleStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(ApiResponse.success(
                motorcycleService.search(brandId, categoryId, minPrice, maxPrice, keyword, status,
                        PageRequest.of(page, size, sort))));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<?>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.success(motorcycleService.getFeatured()));
    }

    @GetMapping("/suggested/{id}")
    public ResponseEntity<ApiResponse<?>> getSuggested(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(motorcycleService.getSuggested(id)));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<?>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(motorcycleService.getBySlug(slug)));
    }
}
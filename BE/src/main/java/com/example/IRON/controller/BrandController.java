package com.example.IRON.controller;

import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.service.interfaces.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {
    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success(brandService.getAllActive()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(brandService.getById(id)));
    }
}

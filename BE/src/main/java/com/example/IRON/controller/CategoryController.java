package com.example.IRON.controller;

import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.service.interfaces.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllActive()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getById(id)));
    }
}

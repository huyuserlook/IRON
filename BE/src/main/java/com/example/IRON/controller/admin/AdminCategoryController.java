package com.example.IRON.controller.admin;

import com.example.IRON.dto.request.CategoryRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.service.interfaces.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/categories")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.create(request), "Thêm dòng xe thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.update(id, request), "Cập nhật dòng xe thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa dòng xe thành công"));
    }
}
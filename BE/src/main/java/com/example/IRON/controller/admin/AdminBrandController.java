package com.example.IRON.controller.admin;

import com.example.IRON.dto.request.BrandRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.service.interfaces.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/brands")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminBrandController {

    private final BrandService brandService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(brandService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(ApiResponse.success(brandService.create(request), "Thêm hãng xe thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(ApiResponse.success(brandService.update(id, request), "Cập nhật hãng xe thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        brandService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa hãng xe thành công"));
    }
}
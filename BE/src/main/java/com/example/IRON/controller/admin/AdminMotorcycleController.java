package com.example.IRON.controller.admin;

import com.example.IRON.dto.request.MotorcycleRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.service.interfaces.MotorcycleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/motorcycles")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminMotorcycleController {

    private final MotorcycleService motorcycleService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(motorcycleService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<?>> create(@Valid @RequestBody MotorcycleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(motorcycleService.create(request), "Thêm xe thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> update(@PathVariable Long id, @Valid @RequestBody MotorcycleRequest request) {
        return ResponseEntity.ok(ApiResponse.success(motorcycleService.update(id, request), "Cập nhật xe thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        motorcycleService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa xe thành công"));
    }
}

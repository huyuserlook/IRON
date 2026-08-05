package com.example.IRON.controller.admin;

import com.example.IRON.dto.request.ContactStatusRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.service.interfaces.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/admin/contacts")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminContactController {

    private final ContactService contactService;

    @GetMapping("/count-new")
    public ResponseEntity<ApiResponse<?>> countNew() {
        return ResponseEntity.ok(ApiResponse.success(contactService.countNew()));
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
                contactService.search(keyword, status, PageRequest.of(page, size, sort))));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<?>> updateStatus(
            @PathVariable Long id,
            @RequestBody @Valid ContactStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                contactService.updateStatus(id, request), "Cập nhật trạng thái liên hệ thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        contactService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa liên hệ thành công"));
    }
}

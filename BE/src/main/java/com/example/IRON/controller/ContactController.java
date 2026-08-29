package com.example.IRON.controller;

import com.example.IRON.dto.request.ContactRequest;
import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.dto.response.ContactResponse;
import com.example.IRON.service.interfaces.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<ApiResponse<ContactResponse>> create(@RequestBody @Valid ContactRequest request) {
        ContactResponse res = contactService.create(request);
        return ResponseEntity.ok(ApiResponse.success(res, "Gửi liên hệ thành công"));
    }
}

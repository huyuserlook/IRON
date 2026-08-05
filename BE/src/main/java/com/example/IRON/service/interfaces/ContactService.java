package com.example.IRON.service.interfaces;

import com.example.IRON.dto.request.ContactRequest;
import com.example.IRON.dto.request.ContactStatusRequest;
import com.example.IRON.dto.response.ContactResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ContactService {
    ContactResponse create(ContactRequest request);
    Page<ContactResponse> search(String keyword, String status, Pageable pageable);
    ContactResponse getById(Long id);
    ContactResponse updateStatus(Long id, ContactStatusRequest request);
    void delete(Long id);
    long countNew();
}

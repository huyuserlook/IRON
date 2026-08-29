package com.example.IRON.service.interfaces;

import com.example.IRON.dto.request.InstallmentRequest;
import com.example.IRON.dto.response.InstallmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InstallmentService {
    InstallmentResponse createInstallment(Long userId, InstallmentRequest request);
    Page<InstallmentResponse> getMyInstallments(Long userId, Pageable pageable);
    InstallmentResponse getMyInstallment(Long installmentId, Long userId);
    Page<InstallmentResponse> getAllInstallments(Pageable pageable, String status);
    InstallmentResponse getInstallmentById(Long id);
    InstallmentResponse updateStatus(Long installmentId, String status, String note);
    void deleteInstallment(Long installmentId);
}

package com.example.IRON.service.interfaces;

import com.example.IRON.dto.request.CreateDepositRequest;
import com.example.IRON.dto.response.DepositResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface DepositService {
    DepositResponse createDeposit(Long userId, Long orderId, CreateDepositRequest request);
    DepositResponse getMyDeposit(Long depositId, Long userId);
    DepositResponse getDepositByOrderId(Long orderId);
    Page<DepositResponse> getMyDeposits(Long userId, Pageable pageable);
    DepositResponse payRemaining(Long depositId, Long userId);
    DepositResponse updateStatus(Long depositId, String status, String note, Long actorId, String actorEmail);
    Page<DepositResponse> getAllDeposits(Pageable pageable);
    DepositResponse getDepositById(Long id);
}

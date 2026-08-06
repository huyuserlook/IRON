package com.example.IRON.service.interfaces;

import com.example.IRON.dto.request.PaymentMethodRequest;
import com.example.IRON.dto.response.PaymentMethodResponse;
import java.util.List;

public interface PaymentMethodService {
    List<PaymentMethodResponse> getAll();
    List<PaymentMethodResponse> getAllActive();
    PaymentMethodResponse getById(Long id);
    PaymentMethodResponse create(PaymentMethodRequest request);
    PaymentMethodResponse update(Long id, PaymentMethodRequest request);
    void delete(Long id);
}
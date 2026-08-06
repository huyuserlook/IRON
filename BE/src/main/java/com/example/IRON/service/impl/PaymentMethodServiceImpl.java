package com.example.IRON.service.impl;

import com.example.IRON.dto.request.PaymentMethodRequest;
import com.example.IRON.dto.response.PaymentMethodResponse;
import com.example.IRON.entity.PaymentMethod;
import com.example.IRON.exception.DuplicateResourceException;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.PaymentMethodRepository;
import com.example.IRON.service.interfaces.PaymentMethodService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentMethodServiceImpl implements PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;

    @Override
    public List<PaymentMethodResponse> getAll() {
        List<PaymentMethodResponse> result = new ArrayList<>();
        for (PaymentMethod pm : paymentMethodRepository.findAll()) {
            result.add(PaymentMethodResponse.fromEntity(pm));
        }
        return result;
    }

    @Override
    public List<PaymentMethodResponse> getAllActive() {
        List<PaymentMethodResponse> result = new ArrayList<>();
        for (PaymentMethod pm : paymentMethodRepository.findByActiveTrueOrderBySortOrderAsc()) {
            result.add(PaymentMethodResponse.fromEntity(pm));
        }
        return result;
    }

    @Override
    public PaymentMethodResponse getById(Long id) {
        return PaymentMethodResponse.fromEntity(findById(id));
    }

    @Override
    @Transactional
    public PaymentMethodResponse create(PaymentMethodRequest request) {
        if (paymentMethodRepository.existsByCode(request.getCode()))
            throw new DuplicateResourceException("Mã phương thức thanh toán đã tồn tại: " + request.getCode());
        if (paymentMethodRepository.existsByName(request.getName()))
            throw new DuplicateResourceException("Tên phương thức thanh toán đã tồn tại: " + request.getName());

        PaymentMethod pm = new PaymentMethod();
        pm.setName(request.getName());
        pm.setCode(request.getCode());
        pm.setDescription(request.getDescription());
        pm.setIconUrl(request.getIconUrl());
        pm.setActive(request.getActive() != null ? request.getActive() : Boolean.TRUE);
        pm.setSortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0);

        return PaymentMethodResponse.fromEntity(paymentMethodRepository.save(pm));
    }

    @Override
    @Transactional
    public PaymentMethodResponse update(Long id, PaymentMethodRequest request) {
        PaymentMethod pm = findById(id);

        if (!pm.getCode().equals(request.getCode()) && paymentMethodRepository.existsByCode(request.getCode()))
            throw new DuplicateResourceException("Mã phương thức thanh toán đã tồn tại: " + request.getCode());
        if (!pm.getName().equals(request.getName()) && paymentMethodRepository.existsByName(request.getName()))
            throw new DuplicateResourceException("Tên phương thức thanh toán đã tồn tại: " + request.getName());

        pm.setName(request.getName());
        pm.setCode(request.getCode());
        if (request.getDescription() != null) pm.setDescription(request.getDescription());
        if (request.getIconUrl() != null) pm.setIconUrl(request.getIconUrl());
        if (request.getActive() != null) pm.setActive(request.getActive());
        if (request.getSortOrder() != null) pm.setSortOrder(request.getSortOrder());

        return PaymentMethodResponse.fromEntity(paymentMethodRepository.save(pm));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        PaymentMethod pm = findById(id);
        paymentMethodRepository.delete(pm);
    }

    private PaymentMethod findById(Long id) {
        return paymentMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phương thức thanh toán", "id", id));
    }
}
package com.example.IRON.service.interfaces;

import com.example.IRON.dto.request.MotorcycleRequest;
import com.example.IRON.dto.response.MotorcycleDetailResponse;
import com.example.IRON.dto.response.MotorcycleResponse;
import com.example.IRON.entity.Motorcycle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface MotorcycleService {
    Page<MotorcycleResponse> search(Long brandId, Long categoryId,
                                    BigDecimal minPrice, BigDecimal maxPrice,
                                    String keyword, Motorcycle.MotorcycleStatus status,
                                    Pageable pageable);
    MotorcycleDetailResponse getBySlug(String slug);
    MotorcycleDetailResponse getById(Long id);
    List<MotorcycleResponse> getFeatured();
    List<MotorcycleResponse> getSuggested(Long motorcycleId);
    MotorcycleDetailResponse create(MotorcycleRequest request);
    MotorcycleDetailResponse update(Long id, MotorcycleRequest request);
    void delete(Long id);
}
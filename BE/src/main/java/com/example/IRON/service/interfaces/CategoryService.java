package com.example.IRON.service.interfaces;

import com.example.IRON.dto.request.CategoryRequest;
import com.example.IRON.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAll();
    List<CategoryResponse> getAllActive();
    CategoryResponse getById(Long id);
    CategoryResponse create(CategoryRequest request);
    CategoryResponse update(Long id, CategoryRequest request);
    void delete(Long id);
}
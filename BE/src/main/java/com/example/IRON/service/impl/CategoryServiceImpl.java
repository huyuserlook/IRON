package com.example.IRON.service.impl;

import com.example.IRON.dto.request.CategoryRequest;
import com.example.IRON.dto.response.CategoryResponse;
import com.example.IRON.entity.Category;
import com.example.IRON.exception.DuplicateResourceException;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.CategoryRepository;
import com.example.IRON.repository.MotorcycleRepository;
import com.example.IRON.service.interfaces.CategoryService;
import com.example.IRON.utils.SlugUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final MotorcycleRepository motorcycleRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository,
                               MotorcycleRepository motorcycleRepository) {
        this.categoryRepository = categoryRepository;
        this.motorcycleRepository = motorcycleRepository;
    }

    @Override
    public List<CategoryResponse> getAll() {
        List<CategoryResponse> result = new ArrayList<>();
        for (Category c : categoryRepository.findAll()) result.add(toResponse(c));
        return result;
    }

    @Override
    public List<CategoryResponse> getAllActive() {
        List<CategoryResponse> result = new ArrayList<>();
        for (Category c : categoryRepository.findByActiveTrue()) result.add(toResponse(c));
        return result;
    }

    @Override
    public CategoryResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName()))
            throw new DuplicateResourceException("Dòng xe đã tồn tại: " + request.getName());
        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(SlugUtils.toSlug(request.getName()));
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setActive(request.getActive() != null ? request.getActive() : Boolean.TRUE);
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findById(id);
        category.setName(request.getName());
        category.setSlug(SlugUtils.toSlug(request.getName()));
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getImageUrl() != null) category.setImageUrl(request.getImageUrl());
        if (request.getActive() != null) category.setActive(request.getActive());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Category category = findById(id);
        long count = motorcycleRepository.countByCategoryId(id);
        if (count > 0) throw new RuntimeException("Không thể xóa dòng xe đang có " + count + " xe");
        categoryRepository.delete(category);
    }

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dòng xe", "id", id));
    }

    private CategoryResponse toResponse(Category c) {
        CategoryResponse res = new CategoryResponse();
        res.setId(c.getId());
        res.setName(c.getName());
        res.setSlug(c.getSlug());
        res.setDescription(c.getDescription());
        res.setImageUrl(c.getImageUrl());
        res.setActive(c.getActive());
        res.setMotorcycleCount(motorcycleRepository.countByCategoryId(c.getId()));
        return res;
    }
}
package com.example.IRON.service.impl;

import com.example.IRON.dto.request.BrandRequest;
import com.example.IRON.dto.response.BrandResponse;
import com.example.IRON.entity.Brand;
import com.example.IRON.exception.DuplicateResourceException;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.BrandRepository;
import com.example.IRON.repository.MotorcycleRepository;
import com.example.IRON.service.interfaces.BrandService;
import com.example.IRON.utils.SlugUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final MotorcycleRepository motorcycleRepository;

    public BrandServiceImpl(BrandRepository brandRepository,
                            MotorcycleRepository motorcycleRepository) {
        this.brandRepository = brandRepository;
        this.motorcycleRepository = motorcycleRepository;
    }

    @Override
    public List<BrandResponse> getAll() {
        List<BrandResponse> result = new ArrayList<>();
        for (Brand b : brandRepository.findAll()) result.add(toResponse(b));
        return result;
    }

    @Override
    public List<BrandResponse> getAllActive() {
        List<BrandResponse> result = new ArrayList<>();
        for (Brand b : brandRepository.findByActiveTrue()) result.add(toResponse(b));
        return result;
    }

    @Override
    public BrandResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    @Transactional
    public BrandResponse create(BrandRequest request) {
        if (brandRepository.existsByName(request.getName()))
            throw new DuplicateResourceException("Hãng xe đã tồn tại: " + request.getName());
        Brand brand = new Brand();
        brand.setName(request.getName());
        brand.setSlug(SlugUtils.toSlug(request.getName()));
        brand.setLogoUrl(request.getLogoUrl());
        brand.setDescription(request.getDescription());
        brand.setActive(request.getActive() != null ? request.getActive() : Boolean.TRUE);
        return toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse update(Long id, BrandRequest request) {
        Brand brand = findById(id);
        brand.setName(request.getName());
        brand.setSlug(SlugUtils.toSlug(request.getName()));
        if (request.getLogoUrl() != null) brand.setLogoUrl(request.getLogoUrl());
        if (request.getDescription() != null) brand.setDescription(request.getDescription());
        if (request.getActive() != null) brand.setActive(request.getActive());
        return toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Brand brand = findById(id);
        long count = motorcycleRepository.countByBrandId(id);
        if (count > 0) throw new RuntimeException("Không thể xóa hãng xe đang có " + count + " xe");
        brandRepository.delete(brand);
    }

    private Brand findById(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hãng xe", "id", id));
    }

    private BrandResponse toResponse(Brand b) {
        BrandResponse res = new BrandResponse();
        res.setId(b.getId());
        res.setName(b.getName());
        res.setSlug(b.getSlug());
        res.setLogoUrl(b.getLogoUrl());
        res.setDescription(b.getDescription());
        res.setActive(b.getActive());
        res.setMotorcycleCount(motorcycleRepository.countByBrandId(b.getId()));
        return res;
    }
}
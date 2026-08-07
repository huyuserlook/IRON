package com.example.IRON.service.impl;

import com.example.IRON.dto.request.MotorcycleRequest;
import com.example.IRON.dto.response.BrandResponse;
import com.example.IRON.dto.response.CategoryResponse;
import com.example.IRON.dto.response.MotorcycleDetailResponse;
import com.example.IRON.dto.response.MotorcycleResponse;
import com.example.IRON.dto.response.ReviewResponse;
import com.example.IRON.entity.Brand;
import com.example.IRON.entity.Category;
import com.example.IRON.entity.Inventory;
import com.example.IRON.entity.Motorcycle;
import com.example.IRON.entity.MotorcycleImage;
import com.example.IRON.entity.Review;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.repository.BrandRepository;
import com.example.IRON.repository.CategoryRepository;
import com.example.IRON.repository.MotorcycleRepository;
import com.example.IRON.repository.ReviewRepository;
import com.example.IRON.service.interfaces.MotorcycleService;
import com.example.IRON.utils.SlugUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class MotorcycleServiceImpl implements MotorcycleService {

    private final MotorcycleRepository motorcycleRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    public MotorcycleServiceImpl(MotorcycleRepository motorcycleRepository,
                                 BrandRepository brandRepository,
                                 CategoryRepository categoryRepository,
                                 ReviewRepository reviewRepository) {
        this.motorcycleRepository = motorcycleRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.reviewRepository = reviewRepository;
    }

    @Override
    @Transactional
    public Page<MotorcycleResponse> search(Long brandId, Long categoryId,
                                           BigDecimal minPrice, BigDecimal maxPrice,
                                           String keyword,
                                           Motorcycle.MotorcycleStatus status,
                                           Pageable pageable) {
        String keywordPattern = (keyword == null || keyword.isBlank())
                ? null
                : "%" + keyword.toLowerCase() + "%";
        return motorcycleRepository
                .searchMotorcycles(brandId, categoryId, minPrice, maxPrice, keywordPattern, status, pageable)
                .map(this::toResponse);
    }

    @Override
    public MotorcycleDetailResponse getBySlug(String slug) {
        Motorcycle m = motorcycleRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Xe máy", "slug", slug));
        return toDetailResponse(m);
    }

    @Override
    public MotorcycleDetailResponse getById(Long id) {
        return toDetailResponse(findById(id));
    }

    @Override
    @Transactional
    public List<MotorcycleResponse> getFeatured() {
        List<MotorcycleResponse> result = new ArrayList<>();
        for (Motorcycle m : motorcycleRepository.findByFeaturedTrue()) {
            result.add(toResponse(m));
        }
        return result;
    }

    @Override
    @Transactional
    public List<MotorcycleResponse> getSuggested(Long motorcycleId) {
        Motorcycle current = motorcycleRepository.findById(motorcycleId)
                .orElseThrow(() -> new ResourceNotFoundException("Xe máy", "id", motorcycleId));

        Long categoryId = current.getCategory() != null ? current.getCategory().getId() : null;
        Long brandId = current.getBrand() != null ? current.getBrand().getId() : null;

        List<Motorcycle> candidates = motorcycleRepository.findSuggestedByCategoryOrBrand(
                motorcycleId, categoryId, brandId, Pageable.ofSize(20));

        if (candidates.isEmpty() && (categoryId != null || brandId != null)) {
            candidates = motorcycleRepository.findRecentExcluding(motorcycleId, Pageable.ofSize(20));
        }

        return candidates.stream()
                .limit(4)
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public MotorcycleDetailResponse create(MotorcycleRequest request) {
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Hãng xe", "id", request.getBrandId()));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Dòng xe", "id", request.getCategoryId()));

        Motorcycle motorcycle = new Motorcycle();
        motorcycle.setName(request.getName());
        motorcycle.setSlug(SlugUtils.toSlug(request.getName()));
        motorcycle.setBrand(brand);
        motorcycle.setCategory(category);
        motorcycle.setPrice(request.getPrice());
        motorcycle.setEngineCc(request.getEngineCc());
        motorcycle.setHorsepower(request.getHorsepower());
        motorcycle.setTorque(request.getTorque());
        motorcycle.setYearModel(request.getYearModel());
        motorcycle.setThumbnailUrl(request.getThumbnailUrl());
        motorcycle.setDescription(request.getDescription());
        motorcycle.setSpecifications(request.getSpecifications());
        motorcycle.setStatus(request.getStatus() != null ? request.getStatus() : Motorcycle.MotorcycleStatus.AVAILABLE);
        motorcycle.setFeatured(request.getFeatured() != null ? request.getFeatured() : Boolean.FALSE);

        attachImages(motorcycle, request);
        attachInventories(motorcycle, request);

        return toDetailResponse(motorcycleRepository.save(motorcycle));
    }

    @Override
    @Transactional
    public MotorcycleDetailResponse update(Long id, MotorcycleRequest request) {
        Motorcycle motorcycle = findById(id);
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new ResourceNotFoundException("Hãng xe", "id", request.getBrandId()));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Dòng xe", "id", request.getCategoryId()));

        motorcycle.setName(request.getName());
        motorcycle.setSlug(SlugUtils.toSlug(request.getName()));
        motorcycle.setBrand(brand);
        motorcycle.setCategory(category);
        motorcycle.setPrice(request.getPrice());
        if (request.getEngineCc() != null) motorcycle.setEngineCc(request.getEngineCc());
        if (request.getHorsepower() != null) motorcycle.setHorsepower(request.getHorsepower());
        if (request.getTorque() != null) motorcycle.setTorque(request.getTorque());
        if (request.getYearModel() != null) motorcycle.setYearModel(request.getYearModel());
        if (request.getThumbnailUrl() != null) motorcycle.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getDescription() != null) motorcycle.setDescription(request.getDescription());
        if (request.getSpecifications() != null) motorcycle.setSpecifications(request.getSpecifications());
        if (request.getStatus() != null) motorcycle.setStatus(request.getStatus());
        if (request.getFeatured() != null) motorcycle.setFeatured(request.getFeatured());

        // Cập nhật lại danh sách ảnh & tồn kho
        motorcycle.getImages().clear();
        motorcycle.getInventories().clear();
        attachImages(motorcycle, request);
        attachInventories(motorcycle, request);

        return toDetailResponse(motorcycleRepository.save(motorcycle));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        motorcycleRepository.delete(findById(id));
    }

    /**
     * Gắn danh sách ảnh cho xe.
     * Ảnh đầu tiên sẽ là ảnh chính (isPrimary = true).
     * Nếu xe chưa có thumbnail thì tự lấy ảnh đầu tiên làm thumbnail.
     */
    private void attachImages(Motorcycle motorcycle, MotorcycleRequest request) {
        List<String> rawImages = request.getImages();
        if (rawImages == null || rawImages.isEmpty()) {
            return;
        }

        for (int i = 0; i < rawImages.size(); i++) {
            String url = rawImages.get(i);
            if (url == null || url.isBlank()) {
                continue;
            }
            MotorcycleImage image = new MotorcycleImage();
            image.setMotorcycle(motorcycle);
            image.setImageUrl(url.trim());
            image.setSortOrder(i);
            image.setIsPrimary(i == 0);
            motorcycle.getImages().add(image);
        }

        String firstValid = rawImages.stream()
                .filter(u -> u != null && !u.isBlank())
                .findFirst()
                .orElse(null);
        if (firstValid != null && (motorcycle.getThumbnailUrl() == null || motorcycle.getThumbnailUrl().isBlank())) {
            motorcycle.setThumbnailUrl(firstValid.trim());
        }
    }

    /**
     * Gắn danh sách tồn kho theo màu cho xe.
     */
    private void attachInventories(Motorcycle motorcycle, MotorcycleRequest request) {
        List<MotorcycleRequest.InventoryItem> items = request.getInventories();
        if (items == null || items.isEmpty()) {
            return;
        }

        for (MotorcycleRequest.InventoryItem item : items) {
            if (item.getColorName() == null || item.getColorName().isBlank()) {
                continue;
            }
            Inventory inventory = new Inventory();
            inventory.setMotorcycle(motorcycle);
            inventory.setColorName(item.getColorName().trim());
            inventory.setColorCode(item.getColorCode() != null ? item.getColorCode().trim() : null);
            inventory.setQuantity(item.getQuantity() != null ? item.getQuantity() : 0);
            motorcycle.getInventories().add(inventory);
        }
    }

    private Motorcycle findById(Long id) {
        return motorcycleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Xe máy", "id", id));
    }

    private MotorcycleResponse toResponse(Motorcycle m) {
        MotorcycleResponse res = new MotorcycleResponse();
        res.setId(m.getId());
        res.setName(m.getName());
        res.setSlug(m.getSlug());
        res.setBrandName(m.getBrand().getName());
        res.setCategoryName(m.getCategory().getName());
        res.setPrice(m.getPrice());
        res.setEngineCc(m.getEngineCc());
        res.setThumbnailUrl(m.getThumbnailUrl());
        res.setStatus(m.getStatus());
        res.setFeatured(m.getFeatured());
        String secondary = m.getImages().stream()
                .filter(img -> img.getImageUrl() != null && !img.getImageUrl().isBlank())
                .findFirst()
                .map(MotorcycleImage::getImageUrl)
                .orElse(m.getThumbnailUrl());
        res.setImageUrl(secondary);
        int total = 0;
        for (Inventory inv : m.getInventories()) {
            total += (inv.getQuantity() != null ? inv.getQuantity() : 0);
        }
        res.setTotalInventory(total);
        return res;
    }

    private ReviewResponse toResponse(Review r) {
        ReviewResponse rr = new ReviewResponse();
        rr.setId(r.getId());
        if (r.getMotorcycle() != null) {
            rr.setMotorcycleId(r.getMotorcycle().getId());
            rr.setMotorcycleName(r.getMotorcycle().getName());
        }
        rr.setCustomerName(r.getCustomerName());
        rr.setCustomerEmail(r.getCustomerEmail());
        rr.setTitle(r.getTitle());
        rr.setRating(r.getRating());
        rr.setComment(r.getComment());
        rr.setImageUrl(r.getImageUrl());
        rr.setStatus(r.getStatus());
        rr.setCreatedAt(r.getCreatedAt());
        return rr;
    }

    private MotorcycleDetailResponse toDetailResponse(Motorcycle m) {
        List<MotorcycleDetailResponse.ImageResponse> images = new ArrayList<>();
        for (MotorcycleImage img : m.getImages()) {
            MotorcycleDetailResponse.ImageResponse ir = new MotorcycleDetailResponse.ImageResponse();
            ir.setId(img.getId());
            ir.setImageUrl(img.getImageUrl());
            ir.setColorName(img.getColorName());
            ir.setSortOrder(img.getSortOrder());
            ir.setIsPrimary(img.getIsPrimary());
            images.add(ir);
        }

        List<MotorcycleDetailResponse.InventoryResponse> inventories = new ArrayList<>();
        for (Inventory inv : m.getInventories()) {
            MotorcycleDetailResponse.InventoryResponse ir = new MotorcycleDetailResponse.InventoryResponse();
            ir.setId(inv.getId());
            ir.setColorName(inv.getColorName());
            ir.setColorCode(inv.getColorCode());
            ir.setQuantity(inv.getQuantity());
            inventories.add(ir);
        }

        BrandResponse brandRes = new BrandResponse();
        brandRes.setId(m.getBrand().getId());
        brandRes.setName(m.getBrand().getName());
        brandRes.setSlug(m.getBrand().getSlug());

        CategoryResponse catRes = new CategoryResponse();
        catRes.setId(m.getCategory().getId());
        catRes.setName(m.getCategory().getName());
        catRes.setSlug(m.getCategory().getSlug());

        MotorcycleDetailResponse res = new MotorcycleDetailResponse();
        res.setId(m.getId());
        res.setName(m.getName());
        res.setSlug(m.getSlug());
        res.setBrand(brandRes);
        res.setCategory(catRes);
        res.setPrice(m.getPrice());
        res.setEngineCc(m.getEngineCc());
        res.setHorsepower(m.getHorsepower());
        res.setTorque(m.getTorque());
        res.setYearModel(m.getYearModel());
        res.setThumbnailUrl(m.getThumbnailUrl());
        res.setDescription(m.getDescription());
        res.setSpecifications(m.getSpecifications());
        res.setStatus(m.getStatus());
        res.setFeatured(m.getFeatured());
        res.setImages(images);
        res.setInventories(inventories);
        res.setReviews(reviewRepository
                .findByMotorcycleIdAndStatusOrderByCreatedAtDesc(m.getId(), Review.ReviewStatus.APPROVED)
                .stream()
                .map(this::toResponse)
                .toList());
        res.setCreatedAt(m.getCreatedAt());
        return res;
    }
}

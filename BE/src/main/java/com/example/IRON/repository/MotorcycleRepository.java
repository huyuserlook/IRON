package com.example.IRON.repository;

import com.example.IRON.entity.Motorcycle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface MotorcycleRepository extends JpaRepository<Motorcycle, Long> {

    Optional<Motorcycle> findBySlug(String slug);

    List<Motorcycle> findByFeaturedTrue();

    long countByBrandId(Long brandId);

    long countByCategoryId(Long categoryId);

    @Query("""
        SELECT m FROM Motorcycle m
        WHERE (:brandId IS NULL OR m.brand.id = :brandId)
          AND (:categoryId IS NULL OR m.category.id = :categoryId)
          AND (:minPrice IS NULL OR m.price >= :minPrice)
          AND (:maxPrice IS NULL OR m.price <= :maxPrice)
          AND (:keyword IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:status IS NULL OR m.status = :status)
    """)
    Page<Motorcycle> searchMotorcycles(
            @Param("brandId") Long brandId,
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("keyword") String keyword,
            @Param("status") Motorcycle.MotorcycleStatus status,
            Pageable pageable
    );
}
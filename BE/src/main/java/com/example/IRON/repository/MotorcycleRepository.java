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
          AND (:keywordPattern IS NULL OR LOWER(m.name) LIKE LOWER(:keywordPattern))
          AND (:status IS NULL OR m.status = :status)
    """)
    Page<Motorcycle> searchMotorcycles(
            @Param("brandId") Long brandId,
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("keywordPattern") String keywordPattern,
            @Param("status") Motorcycle.MotorcycleStatus status,
            Pageable pageable
    );

    @Query("""
        SELECT m FROM Motorcycle m
        WHERE m.id != :excludeId
          AND m.status = 'AVAILABLE'
          AND (
            m.category.id = :categoryId
            OR m.brand.id = :brandId
          )
        ORDER BY
          CASE
            WHEN m.category.id = :categoryId AND m.brand.id = :brandId THEN 1
            WHEN m.category.id = :categoryId THEN 2
            ELSE 3
          END,
          m.createdAt DESC
    """)
    List<Motorcycle> findSuggestedByCategoryOrBrand(
            @Param("excludeId") Long excludeId,
            @Param("categoryId") Long categoryId,
            @Param("brandId") Long brandId,
            Pageable pageable
    );

    @Query("""
        SELECT m FROM Motorcycle m
        WHERE m.id != :excludeId
          AND m.status = 'AVAILABLE'
        ORDER BY m.createdAt DESC
    """)
    List<Motorcycle> findRecentExcluding(
            @Param("excludeId") Long excludeId,
            Pageable pageable
    );
}
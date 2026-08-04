package com.example.IRON.repository;

import com.example.IRON.entity.Review;
import com.example.IRON.entity.Review.ReviewStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Query("""
        SELECT r FROM Review r
        WHERE (:status IS NULL OR r.status = :status)
          AND (:keyword IS NULL OR (
                LOWER(r.customerName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(r.comment) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(r.motorcycle.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            ))
    """)
    Page<Review> searchReviews(
            @Param("keyword") String keyword,
            @Param("status") ReviewStatus status,
            Pageable pageable
    );

    List<Review> findByMotorcycleIdAndStatusOrderByCreatedAtDesc(Long motorcycleId, ReviewStatus status);
}

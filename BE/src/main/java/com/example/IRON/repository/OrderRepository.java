package com.example.IRON.repository;

import com.example.IRON.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    Page<Order> findByUserId(Long userId, Pageable pageable);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt >= :since")
    long countNewOrders(@Param("since") LocalDateTime since);

    @Query("SELECT o FROM Order o WHERE o.createdAt >= :since ORDER BY o.createdAt DESC")
    List<Order> findNewOrders(@Param("since") LocalDateTime since, Pageable pageable);
}

package com.example.IRON.repository;

import com.example.IRON.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    Page<Order> findByUserId(Long userId, Pageable pageable);
    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);
}
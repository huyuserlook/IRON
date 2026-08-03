package com.example.IRON.service.interfaces;

import com.example.IRON.dto.request.OrderRequest;
import com.example.IRON.dto.response.OrderResponse;
import com.example.IRON.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse createOrder(Long userId, OrderRequest request);
    Page<OrderResponse> getMyOrders(Long userId, Pageable pageable);
    OrderResponse getByOrderCode(String orderCode);
    OrderResponse getById(Long id);
    Page<OrderResponse> getAllOrders(Order.OrderStatus status, Pageable pageable);
    OrderResponse updateStatus(Long id, Order.OrderStatus status);
    void cancelOrder(Long id, Long userId);
}
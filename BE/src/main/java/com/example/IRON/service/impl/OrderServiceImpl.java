package com.example.IRON.service.impl;

import com.example.IRON.dto.request.OrderRequest;
import com.example.IRON.dto.response.OrderResponse;
import com.example.IRON.entity.*;
import com.example.IRON.exception.ResourceNotFoundException;
import com.example.IRON.exception.UnauthorizedException;
import com.example.IRON.repository.*;
import com.example.IRON.service.interfaces.NotificationService;
import com.example.IRON.service.interfaces.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final MotorcycleRepository motorcycleRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public OrderResponse createOrder(Long userId, OrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<OrderDetail> details = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setCustomerNote(request.getCustomerNote());
        order.setStatus(Order.OrderStatus.PENDING);

        for (OrderRequest.OrderItemRequest item : request.getItems()) {
            Motorcycle motorcycle = motorcycleRepository.findById(item.getMotorcycleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Xe máy", "id", item.getMotorcycleId()));
            BigDecimal subtotal = motorcycle.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(subtotal);

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setMotorcycle(motorcycle);
            detail.setMotorcycleName(motorcycle.getName());
            detail.setColorName(item.getColorName());
            detail.setQuantity(item.getQuantity());
            detail.setUnitPrice(motorcycle.getPrice());
            detail.setSubtotal(subtotal);
            details.add(detail);
        }

        order.setTotalAmount(total);
        order.setOrderDetails(details);
        Order saved = orderRepository.save(order);

        saved.setOrderCode(String.format("ORD-%s-%04d",
                saved.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyyMMdd")),
                saved.getId()));
        saved = orderRepository.save(saved);

        Payment payment = new Payment();
        payment.setOrder(saved);
        payment.setAmount(total);
        payment.setPaymentMethod(request.getPaymentMethod());
        if (request.getPaymentMethod() == Payment.PaymentMethod.CASH) {
            payment.setStatus(Payment.PaymentStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
        } else {
            payment.setStatus(Payment.PaymentStatus.PENDING);
        }
        paymentRepository.save(payment);

        String customerName = user.getFullName() != null ? user.getFullName() : user.getEmail();
        notificationService.createNotification(
                "ORDER",
                "Đơn hàng mới",
                "Đơn hàng " + saved.getOrderCode() + " từ " + customerName + " - " + total + " VND",
                "/admin/orders",
                saved.getId()
        );

        return toResponse(saved);
    }

    @Override
    public Page<OrderResponse> getMyOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable).map(this::toResponse);
    }

    @Override
    public OrderResponse getByOrderCode(String orderCode) {
        return toResponse(orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "code", orderCode)));
    }

    @Override
    public OrderResponse getById(Long id) {
        return toResponse(orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", id)));
    }

    @Override
    public Page<OrderResponse> getAllOrders(Order.OrderStatus status, Pageable pageable) {
        if (status != null) return orderRepository.findByStatus(status, pageable).map(this::toResponse);
        return orderRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", id));
        order.setStatus(status);
        if (status == Order.OrderStatus.DELIVERED) {
            paymentRepository.findByOrderId(id).ifPresent(p -> {
                p.setStatus(Payment.PaymentStatus.PAID);
                p.setPaidAt(LocalDateTime.now());
                paymentRepository.save(p);
            });
        }
        return toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public void cancelOrder(Long id, Long userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", id));
        if (!order.getUser().getId().equals(userId))
            throw new UnauthorizedException("Bạn không có quyền hủy đơn hàng này");
        if (order.getStatus() != Order.OrderStatus.PENDING)
            throw new RuntimeException("Chỉ có thể hủy đơn hàng đang chờ xác nhận");
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng", "id", id));
        orderRepository.deleteById(id);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderResponse.OrderItemResponse> items = order.getOrderDetails().stream()
                .map(d -> OrderResponse.OrderItemResponse.builder()
                        .motorcycleId(d.getMotorcycle().getId())
                        .motorcycleName(d.getMotorcycleName())
                        .colorName(d.getColorName())
                        .thumbnailUrl(d.getMotorcycle().getThumbnailUrl())
                        .quantity(d.getQuantity())
                        .unitPrice(d.getUnitPrice())
                        .subtotal(d.getSubtotal()).build())
                .toList();

        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);

        return OrderResponse.builder()
                .id(order.getId()).orderCode(order.getOrderCode())
                .customerName(order.getUser().getFullName())
                .customerEmail(order.getUser().getEmail())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .shippingAddress(order.getShippingAddress())
                .customerNote(order.getCustomerNote())
                .paymentMethod(payment != null ? payment.getPaymentMethod() : null)
                .paymentStatus(payment != null ? payment.getStatus() : null)
                .items(items).createdAt(order.getCreatedAt()).build();
    }
}

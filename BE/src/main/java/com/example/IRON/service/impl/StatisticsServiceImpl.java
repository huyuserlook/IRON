package com.example.IRON.service.impl;

import com.example.IRON.dto.response.StatisticsResponse;
import com.example.IRON.entity.Order;
import com.example.IRON.entity.OrderDetail;
import com.example.IRON.repository.MotorcycleRepository;
import com.example.IRON.repository.OrderDetailRepository;
import com.example.IRON.repository.OrderRepository;
import com.example.IRON.repository.UserRepository;
import com.example.IRON.service.interfaces.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final MotorcycleRepository motorcycleRepository;
    private final OrderDetailRepository orderDetailRepository;

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse getStatistics() {
        List<Order> revenueOrders = orderRepository.findAll().stream()
                .filter(this::countsAsRevenue)
                .toList();

        BigDecimal totalRevenue = revenueOrders.stream()
                .map(Order::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<StatisticsResponse.MonthlyRevenue> monthlyRevenues = revenueOrders.stream()
                .filter(order -> order.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        order -> monthKey(order.getCreatedAt()),
                        LinkedHashMap::new,
                        Collectors.toList()
                ))
                .entrySet()
                .stream()
                .map(entry -> toMonthlyRevenue(entry.getKey(), entry.getValue()))
                .sorted(Comparator
                        .comparingInt(StatisticsResponse.MonthlyRevenue::getYear)
                        .thenComparingInt(StatisticsResponse.MonthlyRevenue::getMonth))
                .toList();

        List<StatisticsResponse.TopMotorcycle> topMotorcycles = orderDetailRepository.findAll().stream()
                .collect(Collectors.groupingBy(detail -> detail.getMotorcycle().getId()))
                .values()
                .stream()
                .map(this::toTopMotorcycle)
                .sorted(Comparator.comparing(StatisticsResponse.TopMotorcycle::getRevenue).reversed())
                .limit(5)
                .toList();

        return StatisticsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(orderRepository.count())
                .totalCustomers(userRepository.count())
                .totalMotorcycles(motorcycleRepository.count())
                .monthlyRevenues(monthlyRevenues)
                .topMotorcycles(topMotorcycles)
                .build();
    }

    private boolean countsAsRevenue(Order order) {
        return order.getStatus() != Order.OrderStatus.CANCELLED
                && order.getStatus() != Order.OrderStatus.REFUNDED;
    }

    private String monthKey(LocalDateTime dateTime) {
        return dateTime.getYear() + "-" + dateTime.getMonthValue();
    }

    private StatisticsResponse.MonthlyRevenue toMonthlyRevenue(String key, List<Order> orders) {
        String[] parts = key.split("-");
        BigDecimal revenue = orders.stream()
                .map(Order::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return StatisticsResponse.MonthlyRevenue.builder()
                .year(Integer.parseInt(parts[0]))
                .month(Integer.parseInt(parts[1]))
                .revenue(revenue)
                .orderCount(orders.size())
                .build();
    }

    private StatisticsResponse.TopMotorcycle toTopMotorcycle(List<OrderDetail> details) {
        OrderDetail first = details.get(0);
        long soldCount = details.stream()
                .map(OrderDetail::getQuantity)
                .filter(quantity -> quantity != null)
                .mapToLong(Integer::longValue)
                .sum();
        BigDecimal revenue = details.stream()
                .map(OrderDetail::getSubtotal)
                .filter(subtotal -> subtotal != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return StatisticsResponse.TopMotorcycle.builder()
                .motorcycleId(first.getMotorcycle().getId())
                .motorcycleName(first.getMotorcycleName())
                .thumbnailUrl(first.getMotorcycle().getThumbnailUrl())
                .soldCount(soldCount)
                .revenue(revenue)
                .build();
    }
}

package com.example.IRON.service.impl;

import com.example.IRON.dto.response.StatisticsResponse;
import com.example.IRON.entity.Order;
import com.example.IRON.entity.OrderDetail;
import com.example.IRON.entity.Payment;
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
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
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

        BigDecimal totalProfit = calculateTotalProfit(revenueOrders);

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

        List<StatisticsResponse.YearlyRevenue> yearlyRevenues = monthlyRevenues.stream()
                .collect(Collectors.groupingBy(
                        StatisticsResponse.MonthlyRevenue::getYear,
                        LinkedHashMap::new,
                        Collectors.toList()
                ))
                .entrySet()
                .stream()
                .map(entry -> StatisticsResponse.YearlyRevenue.builder()
                        .year(entry.getKey())
                        .revenue(entry.getValue().stream()
                                .map(StatisticsResponse.MonthlyRevenue::getRevenue)
                                .filter(amount -> amount != null)
                                .reduce(BigDecimal.ZERO, BigDecimal::add))
                        .profit(entry.getValue().stream()
                                .map(StatisticsResponse.MonthlyRevenue::getProfit)
                                .filter(amount -> amount != null)
                                .reduce(BigDecimal.ZERO, BigDecimal::add))
                        .orderCount(entry.getValue().stream()
                                .mapToLong(StatisticsResponse.MonthlyRevenue::getOrderCount)
                                .sum())
                        .build())
                .sorted(Comparator.comparingInt(StatisticsResponse.YearlyRevenue::getYear))
                .toList();

        List<StatisticsResponse.TopMotorcycle> topMotorcycles = buildTopMotorcycles(revenueOrders);

        return StatisticsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalProfit(totalProfit)
                .totalOrders(orderRepository.count())
                .totalCustomers(userRepository.count())
                .totalMotorcycles(motorcycleRepository.count())
                .monthlyRevenues(monthlyRevenues)
                .yearlyRevenues(yearlyRevenues)
                .topMotorcycles(topMotorcycles)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StatisticsResponse getStatistics(String type, Integer year, Integer month) {
        LocalDateTime[] range = resolveRange(type, year, month);
        if (range == null) {
            return getStatistics();
        }
        LocalDateTime startDate = range[0];
        LocalDateTime endDate = range[1];

        List<Order> revenueOrders = orderRepository.findAll().stream()
                .filter(this::countsAsRevenue)
                .filter(order -> {
                    LocalDateTime createdAt = order.getCreatedAt();
                    return createdAt != null && !createdAt.isBefore(startDate) && !createdAt.isAfter(endDate);
                })
                .toList();

        BigDecimal totalRevenue = revenueOrders.stream()
                .map(Order::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalProfit = calculateTotalProfit(revenueOrders);

        long totalOrders = revenueOrders.size();
        long avgOrderValue = totalOrders > 0 ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), BigDecimal.ROUND_HALF_UP).longValue() : 0;

        List<StatisticsResponse.MonthlyRevenue> monthlyRevenues = List.of();
        List<StatisticsResponse.DailyRevenue> dailyRevenues = List.of();
        List<StatisticsResponse.YearlyRevenue> yearlyRevenues = List.of();

        if ("year".equalsIgnoreCase(type) && year != null) {
            monthlyRevenues = revenueOrders.stream()
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
            monthlyRevenues = padMonthlyRevenues(monthlyRevenues, year);
        } else if ("month".equalsIgnoreCase(type) && year != null && month != null) {
            dailyRevenues = revenueOrders.stream()
                    .filter(order -> order.getCreatedAt() != null)
                    .collect(Collectors.groupingBy(
                            order -> dayKey(order.getCreatedAt()),
                            LinkedHashMap::new,
                            Collectors.toList()
                    ))
                    .entrySet()
                    .stream()
                    .map(entry -> toDailyRevenue(entry.getKey(), entry.getValue()))
                    .sorted(Comparator.comparingInt(StatisticsResponse.DailyRevenue::getDay))
                    .toList();
            dailyRevenues = padDailyRevenues(dailyRevenues, year, month);
        }

        List<StatisticsResponse.TopMotorcycle> topMotorcycles = buildTopMotorcycles(revenueOrders);

        return StatisticsResponse.builder()
                .totalRevenue(totalRevenue)
                .totalProfit(totalProfit)
                .totalOrders(totalOrders)
                .totalCustomers(userRepository.count())
                .totalMotorcycles(motorcycleRepository.count())
                .monthlyRevenues(monthlyRevenues)
                .dailyRevenues(dailyRevenues)
                .yearlyRevenues(yearlyRevenues)
                .topMotorcycles(topMotorcycles)
                .build();
    }

    private boolean countsAsRevenue(Order order) {
        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            return true;
        }
        Payment payment = order.getPayment();
        return payment != null && payment.getStatus() == Payment.PaymentStatus.PAID;
    }

    private String monthKey(LocalDateTime dateTime) {
        return dateTime.getYear() + "-" + dateTime.getMonthValue();
    }

    private String dayKey(LocalDateTime dateTime) {
        return dateTime.getYear() + "-" + dateTime.getMonthValue() + "-" + dateTime.getDayOfMonth();
    }

    private BigDecimal calculateOrderCost(Order order) {
        if (order.getOrderDetails() == null || order.getOrderDetails().isEmpty()) {
            return BigDecimal.ZERO;
        }
        return order.getOrderDetails().stream()
                .map(detail -> {
                    BigDecimal costPrice = BigDecimal.ZERO;
                    if (detail.getMotorcycle() != null && detail.getMotorcycle().getCostPrice() != null) {
                        costPrice = detail.getMotorcycle().getCostPrice();
                    }
                    Integer qty = detail.getQuantity();
                    if (qty == null) qty = 0;
                    return costPrice.multiply(BigDecimal.valueOf(qty));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateTotalProfit(List<Order> revenueOrders) {
        return revenueOrders.stream()
                .map(order -> {
                    BigDecimal totalAmount = order.getTotalAmount();
                    if (totalAmount == null) totalAmount = BigDecimal.ZERO;
                    BigDecimal orderCost = calculateOrderCost(order);
                    return totalAmount.subtract(orderCost);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private StatisticsResponse.MonthlyRevenue toMonthlyRevenue(String key, List<Order> orders) {
        String[] parts = key.split("-");
        BigDecimal revenue = orders.stream()
                .map(Order::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal profit = orders.stream()
                .map(order -> {
                    BigDecimal totalAmount = order.getTotalAmount();
                    if (totalAmount == null) totalAmount = BigDecimal.ZERO;
                    BigDecimal orderCost = calculateOrderCost(order);
                    return totalAmount.subtract(orderCost);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return StatisticsResponse.MonthlyRevenue.builder()
                .year(Integer.parseInt(parts[0]))
                .month(Integer.parseInt(parts[1]))
                .revenue(revenue)
                .profit(profit)
                .orderCount(orders.size())
                .build();
    }

    private StatisticsResponse.DailyRevenue toDailyRevenue(String key, List<Order> orders) {
        String[] parts = key.split("-");
        BigDecimal revenue = orders.stream()
                .map(Order::getTotalAmount)
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal profit = orders.stream()
                .map(order -> {
                    BigDecimal totalAmount = order.getTotalAmount();
                    if (totalAmount == null) totalAmount = BigDecimal.ZERO;
                    BigDecimal orderCost = calculateOrderCost(order);
                    return totalAmount.subtract(orderCost);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return StatisticsResponse.DailyRevenue.builder()
                .year(Integer.parseInt(parts[0]))
                .month(Integer.parseInt(parts[1]))
                .day(Integer.parseInt(parts[2]))
                .revenue(revenue)
                .profit(profit)
                .orderCount(orders.size())
                .build();
    }

    private List<StatisticsResponse.MonthlyRevenue> padMonthlyRevenues(
            List<StatisticsResponse.MonthlyRevenue> actual, int year) {
        Map<Integer, StatisticsResponse.MonthlyRevenue> byMonth = actual.stream()
                .collect(Collectors.toMap(StatisticsResponse.MonthlyRevenue::getMonth, m -> m));

        List<StatisticsResponse.MonthlyRevenue> padded = new java.util.ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            StatisticsResponse.MonthlyRevenue item = byMonth.get(m);
            if (item != null) {
                padded.add(item);
            } else {
                padded.add(StatisticsResponse.MonthlyRevenue.builder()
                        .year(year)
                        .month(m)
                        .revenue(BigDecimal.ZERO)
                        .profit(BigDecimal.ZERO)
                        .orderCount(0)
                        .build());
            }
        }
        return padded;
    }

    private List<StatisticsResponse.DailyRevenue> padDailyRevenues(
            List<StatisticsResponse.DailyRevenue> actual, int year, int month) {
        Map<Integer, StatisticsResponse.DailyRevenue> byDay = actual.stream()
                .collect(Collectors.toMap(StatisticsResponse.DailyRevenue::getDay, d -> d));

        int daysInMonth = YearMonth.of(year, month).lengthOfMonth();
        List<StatisticsResponse.DailyRevenue> padded = new java.util.ArrayList<>();
        for (int d = 1; d <= daysInMonth; d++) {
            StatisticsResponse.DailyRevenue item = byDay.get(d);
            if (item != null) {
                padded.add(item);
            } else {
                padded.add(StatisticsResponse.DailyRevenue.builder()
                        .year(year)
                        .month(month)
                        .day(d)
                        .revenue(BigDecimal.ZERO)
                        .profit(BigDecimal.ZERO)
                        .orderCount(0)
                        .build());
            }
        }
        return padded;
    }

    private List<StatisticsResponse.TopMotorcycle> buildTopMotorcycles(List<Order> revenueOrders) {
        if (revenueOrders.isEmpty()) {
            return List.of();
        }

        Set<Long> revenueOrderIds = revenueOrders.stream()
                .map(Order::getId)
                .collect(Collectors.toSet());

        return orderDetailRepository.findAll().stream()
                .filter(detail -> {
                    Order order = detail.getOrder();
                    return order != null && revenueOrderIds.contains(order.getId());
                })
                .collect(Collectors.groupingBy(detail -> detail.getMotorcycle().getId()))
                .values()
                .stream()
                .map(this::toTopMotorcycle)
                .sorted(Comparator.comparing(StatisticsResponse.TopMotorcycle::getSoldCount).reversed()
                        .thenComparing(StatisticsResponse.TopMotorcycle::getRevenue).reversed())
                .limit(10)
                .toList();
    }

    private LocalDateTime[] resolveRange(String type, Integer year, Integer month) {
        if ("month".equalsIgnoreCase(type) && year != null && month != null) {
            LocalDate firstDay = LocalDate.of(year, month, 1);
            LocalDate lastDay = firstDay.withDayOfMonth(firstDay.lengthOfMonth());
            return new LocalDateTime[]{firstDay.atStartOfDay(), lastDay.atTime(23, 59, 59)};
        }
        if ("year".equalsIgnoreCase(type) && year != null) {
            LocalDate firstDay = LocalDate.of(year, 1, 1);
            LocalDate lastDay = LocalDate.of(year, 12, 31);
            return new LocalDateTime[]{firstDay.atStartOfDay(), lastDay.atTime(23, 59, 59)};
        }
        return null;
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

        BigDecimal cost = details.stream()
                .map(detail -> {
                    BigDecimal costPrice = BigDecimal.ZERO;
                    if (detail.getMotorcycle() != null && detail.getMotorcycle().getCostPrice() != null) {
                        costPrice = detail.getMotorcycle().getCostPrice();
                    }
                    Integer qty = detail.getQuantity();
                    if (qty == null) qty = 0;
                    return costPrice.multiply(BigDecimal.valueOf(qty));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal profit = revenue.subtract(cost);

        return StatisticsResponse.TopMotorcycle.builder()
                .motorcycleId(first.getMotorcycle().getId())
                .motorcycleName(first.getMotorcycleName())
                .thumbnailUrl(first.getMotorcycle().getThumbnailUrl())
                .soldCount(soldCount)
                .revenue(revenue)
                .profit(profit)
                .build();
    }
}

package com.example.IRON.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StatisticsResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalCustomers;
    private long totalMotorcycles;

    private List<MonthlyRevenue> monthlyRevenues;
    private List<DailyRevenue> dailyRevenues;
    private List<YearlyRevenue> yearlyRevenues;
    private List<TopMotorcycle> topMotorcycles;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyRevenue {
        private int month;
        private int year;
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DailyRevenue {
        private int day;
        private int month;
        private int year;
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class YearlyRevenue {
        private int year;
        private BigDecimal revenue;
        private long orderCount;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TopMotorcycle {
        private Long motorcycleId;
        private String motorcycleName;
        private String thumbnailUrl;
        private long soldCount;
        private BigDecimal revenue;
    }
}
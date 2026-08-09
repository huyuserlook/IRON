package com.example.IRON.service.interfaces;

import com.example.IRON.dto.response.StatisticsResponse;

public interface StatisticsService {
    StatisticsResponse getStatistics();

    StatisticsResponse getStatistics(String type, Integer year, Integer month);
}

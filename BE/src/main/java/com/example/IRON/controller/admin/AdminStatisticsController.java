package com.example.IRON.controller.admin;

import com.example.IRON.dto.response.ApiResponse;
import com.example.IRON.service.interfaces.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/statistics")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminStatisticsController {
    private final StatisticsService statisticsService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getStatistics(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        if (type != null) {
            return ResponseEntity.ok(ApiResponse.success(statisticsService.getStatistics(type, year, month)));
        }
        return ResponseEntity.ok(ApiResponse.success(statisticsService.getStatistics()));
    }
}

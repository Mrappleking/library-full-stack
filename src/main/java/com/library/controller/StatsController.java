package com.library.controller;

import com.library.annotation.RequireAdmin;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.MonthlyStatsDTO;
import com.library.dto.response.PopularBookDTO;
import com.library.dto.response.StatsOverviewResponse;
import com.library.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping
    @RequireAdmin
    public ResponseEntity<ApiResponse<StatsOverviewResponse>> getOverview() {
        return ResponseEntity.ok(ApiResponse.success(statsService.getOverview()));
    }

    @GetMapping("/popular")
    @RequireAdmin
    public ResponseEntity<ApiResponse<List<PopularBookDTO>>> getPopular() {
        return ResponseEntity.ok(ApiResponse.success(statsService.getPopular()));
    }

    @GetMapping("/monthly")
    @RequireAdmin
    public ResponseEntity<ApiResponse<List<MonthlyStatsDTO>>> getMonthly() {
        return ResponseEntity.ok(ApiResponse.success(statsService.getMonthly()));
    }
}
package com.library.controller;

import com.library.dto.response.ApiResponse;
import com.library.dto.response.MonthlyStatsDTO;
import com.library.dto.response.PopularBookDTO;
import com.library.dto.response.StatsOverviewResponse;
import com.library.service.StatsService;
import jakarta.servlet.http.HttpServletRequest;
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
    public ResponseEntity<ApiResponse<StatsOverviewResponse>> getOverview(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            return ResponseEntity.status(403).body(ApiResponse.forbidden("仅管理员可查看统计数据"));
        }
        return ResponseEntity.ok(ApiResponse.success(statsService.getOverview()));
    }

    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<PopularBookDTO>>> getPopular(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            return ResponseEntity.status(403).body(ApiResponse.forbidden("仅管理员可查看热门图书"));
        }
        return ResponseEntity.ok(ApiResponse.success(statsService.getPopular()));
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<List<MonthlyStatsDTO>>> getMonthly(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            return ResponseEntity.status(403).body(ApiResponse.forbidden("仅管理员可查看月度统计"));
        }
        return ResponseEntity.ok(ApiResponse.success(statsService.getMonthly()));
    }
}
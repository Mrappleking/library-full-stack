package com.library.controller;

import com.library.dto.response.ApiResponse;
import com.library.service.CacheService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    private final CacheService cacheService;

    public SystemController(CacheService cacheService) {
        this.cacheService = cacheService;
    }

    @PostMapping("/clear-cache")
    public ResponseEntity<ApiResponse<Void>> clearCache(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            return ResponseEntity.status(403).body(ApiResponse.forbidden("仅管理员可清除缓存"));
        }
        cacheService.deletePattern("*");
        return ResponseEntity.ok(ApiResponse.success("缓存已清除", null));
    }

    @PostMapping("/clear-cache/{key}")
    public ResponseEntity<ApiResponse<Void>> clearCacheByKey(@PathVariable String key, HttpServletRequest request) {
        if (key == null) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest("缓存键不能为空"));
        }
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            return ResponseEntity.status(403).body(ApiResponse.forbidden("仅管理员可清除缓存"));
        }
        cacheService.delete(key);
        return ResponseEntity.ok(ApiResponse.success("缓存已清除: " + key, null));
    }
}
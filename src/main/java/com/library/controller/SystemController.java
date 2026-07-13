package com.library.controller;

import com.library.dto.request.ErrorLogRequest;
import com.library.dto.response.ApiResponse;
import com.library.entity.ErrorLog;
import com.library.service.CacheService;
import com.library.service.ErrorLogService;
import com.library.service.MonitorService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    private final CacheService cacheService;
    private final ErrorLogService errorLogService;
    private final MonitorService monitorService;

    public SystemController(CacheService cacheService, ErrorLogService errorLogService, MonitorService monitorService) {
        this.cacheService = cacheService;
        this.errorLogService = errorLogService;
        this.monitorService = monitorService;
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

    @PostMapping("/logs")
    public ResponseEntity<ApiResponse<Void>> receiveLogs(@RequestBody ErrorLogRequest request) {
        if (request.getLogs() == null || request.getLogs().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest("日志数据不能为空"));
        }

        List<ErrorLog> logs = request.getLogs().stream()
            .map(entry -> {
                ErrorLog log = new ErrorLog();
                log.setLogId(entry.getId());
                log.setTimestamp(java.time.LocalDateTime.ofInstant(
                    java.time.Instant.ofEpochMilli(entry.getTimestamp()),
                    java.time.ZoneId.systemDefault()
                ));
                log.setType(entry.getType());
                log.setMessage(entry.getMessage());
                log.setStack(entry.getStack());
                log.setUrl(entry.getUrl());
                log.setMethod(entry.getMethod());
                log.setStatusCode(entry.getStatusCode());
                log.setComponent(entry.getComponent());
                log.setProps(entry.getProps());
                log.setUserId(entry.getUserId());
                log.setUserRole(entry.getUserRole());
                return log;
            })
            .collect(Collectors.toList());

        errorLogService.saveLogs(logs);
        return ResponseEntity.ok(ApiResponse.success("日志已接收", null));
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<ErrorLog>>> getLogs(
        HttpServletRequest request,
        @RequestParam(required = false) String type,
        @RequestParam(required = false) Integer userId
    ) {
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            return ResponseEntity.status(403).body(ApiResponse.forbidden("仅管理员可查看日志"));
        }

        List<ErrorLog> logs;
        if (type != null && !type.isEmpty()) {
            logs = errorLogService.getLogsByType(type);
        } else if (userId != null) {
            logs = errorLogService.getLogsByUserId(userId);
        } else {
            logs = errorLogService.getAllLogs();
        }

        return ResponseEntity.ok(ApiResponse.success("success", logs));
    }

    @GetMapping("/logs/stats")
    public ResponseEntity<ApiResponse<Object>> getLogStats(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            return ResponseEntity.status(403).body(ApiResponse.forbidden("仅管理员可查看日志统计"));
        }

        return ResponseEntity.ok(ApiResponse.success("success", new java.util.HashMap<String, Long>() {{
            put("vue", errorLogService.countByType("vue"));
            put("api", errorLogService.countByType("api"));
            put("global", errorLogService.countByType("global"));
            put("unhandled", errorLogService.countByType("unhandled"));
            put("alert", errorLogService.countByType("alert"));
        }}));
    }

    @GetMapping("/monitor/stats")
    public ResponseEntity<ApiResponse<Object>> getMonitorStats(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            return ResponseEntity.status(403).body(ApiResponse.forbidden("仅管理员可查看监控统计"));
        }

        return ResponseEntity.ok(ApiResponse.success("success", monitorService.getStats()));
    }

    @PostMapping("/monitor/reset")
    public ResponseEntity<ApiResponse<Void>> resetMonitorStats(HttpServletRequest request) {
        String role = (String) request.getAttribute("userRole");
        if (!"admin".equals(role)) {
            return ResponseEntity.status(403).body(ApiResponse.forbidden("仅管理员可重置监控统计"));
        }

        monitorService.resetStats();
        return ResponseEntity.ok(ApiResponse.success("监控统计已重置", null));
    }
}
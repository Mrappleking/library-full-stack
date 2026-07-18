package com.library.controller;

import com.library.annotation.RequireAdmin;
import com.library.dto.request.ErrorLogRequest;
import com.library.dto.response.ApiResponse;
import com.library.entity.ErrorLog;
import com.library.service.CacheService;
import com.library.service.ErrorLogService;
import com.library.service.MonitorService;
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
    @RequireAdmin
    public ResponseEntity<ApiResponse<Void>> clearCache() {
        cacheService.deletePattern("*");
        return ResponseEntity.ok(ApiResponse.success("缓存已清除", null));
    }

    @PostMapping("/clear-cache/{key}")
    @RequireAdmin
    public ResponseEntity<ApiResponse<Void>> clearCacheByKey(@PathVariable String key) {
        if (key == null) {
            return ResponseEntity.badRequest().body(ApiResponse.badRequest("缓存键不能为空"));
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
    @RequireAdmin
    public ResponseEntity<ApiResponse<List<ErrorLog>>> getLogs(
        @RequestParam(required = false) String type,
        @RequestParam(required = false) Integer userId
    ) {
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
    @RequireAdmin
    public ResponseEntity<ApiResponse<Object>> getLogStats() {
        return ResponseEntity.ok(ApiResponse.success("success", new java.util.HashMap<String, Long>() {{
            put("vue", errorLogService.countByType("vue"));
            put("api", errorLogService.countByType("api"));
            put("global", errorLogService.countByType("global"));
            put("unhandled", errorLogService.countByType("unhandled"));
            put("alert", errorLogService.countByType("alert"));
        }}));
    }

    @GetMapping("/monitor/stats")
    @RequireAdmin
    public ResponseEntity<ApiResponse<Object>> getMonitorStats() {
        return ResponseEntity.ok(ApiResponse.success("success", monitorService.getStats()));
    }

    @PostMapping("/monitor/reset")
    @RequireAdmin
    public ResponseEntity<ApiResponse<Void>> resetMonitorStats() {
        monitorService.resetStats();
        return ResponseEntity.ok(ApiResponse.success("监控统计已重置", null));
    }
}
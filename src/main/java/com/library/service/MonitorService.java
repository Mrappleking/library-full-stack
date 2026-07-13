package com.library.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class MonitorService {

    private static final Logger log = LoggerFactory.getLogger(MonitorService.class);

    private final ErrorLogService errorLogService;

    private final Map<String, ApiStats> apiStats = new ConcurrentHashMap<>();
    private final AtomicLong totalRequests = new AtomicLong(0);
    private final AtomicLong errorCount = new AtomicLong(0);

    public MonitorService(ErrorLogService errorLogService) {
        this.errorLogService = errorLogService;
    }

    public void recordApiCall(String endpoint, String method, long duration, int statusCode) {
        String key = method + ":" + endpoint;
        apiStats.computeIfAbsent(key, k -> new ApiStats()).record(duration, statusCode);

        totalRequests.incrementAndGet();
        if (statusCode >= 400) {
            errorCount.incrementAndGet();
        }

        if (duration > 5000) {
            log.warn("[SlowAPI] {} {} took {}ms", method, endpoint, duration);
        }
    }

    public void checkEmptyData(String source, String operation, List<?> data) {
        if (data == null || data.isEmpty()) {
            log.warn("[EmptyData] Source: {}, Operation: {}, Result: empty", source, operation);
            errorLogService.logAlert("空数据告警", "empty_data", "Source: " + source + ", Operation: " + operation);
        }
    }

    public void checkEmptyData(String source, String operation, Object data) {
        if (data == null) {
            log.warn("[EmptyData] Source: {}, Operation: {}, Result: null", source, operation);
            errorLogService.logAlert("空数据告警", "empty_data", "Source: " + source + ", Operation: " + operation);
        }
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new ConcurrentHashMap<>();
        stats.put("totalRequests", totalRequests.get());
        stats.put("errorCount", errorCount.get());
        stats.put("apiStats", apiStats.entrySet().stream()
            .map(e -> Map.of(
                "endpoint", e.getKey(),
                "calls", e.getValue().calls.get(),
                "errors", e.getValue().errors.get(),
                "avgDuration", e.getValue().avgDuration(),
                "maxDuration", e.getValue().maxDuration.get()
            ))
            .toList()
        );
        return stats;
    }

    public void resetStats() {
        apiStats.clear();
        totalRequests.set(0);
        errorCount.set(0);
    }

    private static class ApiStats {
        final AtomicLong calls = new AtomicLong(0);
        final AtomicLong errors = new AtomicLong(0);
        final AtomicLong totalDuration = new AtomicLong(0);
        final AtomicLong maxDuration = new AtomicLong(0);

        void record(long duration, int statusCode) {
            calls.incrementAndGet();
            totalDuration.addAndGet(duration);
            maxDuration.updateAndGet(current -> Math.max(current, duration));
            if (statusCode >= 400) {
                errors.incrementAndGet();
            }
        }

        double avgDuration() {
            long c = calls.get();
            return c > 0 ? (double) totalDuration.get() / c : 0;
        }
    }
}

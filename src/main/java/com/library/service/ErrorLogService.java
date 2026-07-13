package com.library.service;

import com.library.entity.ErrorLog;
import com.library.mapper.ErrorLogMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ErrorLogService {

    private static final Logger log = LoggerFactory.getLogger(ErrorLogService.class);

    private final ErrorLogMapper errorLogMapper;

    public ErrorLogService(ErrorLogMapper errorLogMapper) {
        this.errorLogMapper = errorLogMapper;
    }

    @Transactional
    public void saveLogs(List<ErrorLog> logs) {
        if (logs == null || logs.isEmpty()) return;

        try {
            errorLogMapper.batchInsert(logs);
            log.info("Saved {} error logs", logs.size());
        } catch (Exception e) {
            log.error("Failed to save error logs", e);
        }
    }

    public List<ErrorLog> getAllLogs() {
        return errorLogMapper.findAll();
    }

    public List<ErrorLog> getLogsByType(String type) {
        return errorLogMapper.findByType(type);
    }

    public List<ErrorLog> getLogsByTimeRange(LocalDateTime start, LocalDateTime end) {
        return errorLogMapper.findByTimeRange(start, end);
    }

    public List<ErrorLog> getLogsByUserId(Integer userId) {
        return errorLogMapper.findByUserId(userId);
    }

    public long countByType(String type) {
        return errorLogMapper.countByType(type);
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupOldLogs() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        try {
            errorLogMapper.deleteByTimeBefore(thirtyDaysAgo);
            log.info("Cleaned up error logs older than 30 days");
        } catch (Exception e) {
            log.error("Failed to cleanup old error logs", e);
        }
    }

    public void logAlert(String message, String type, String detail) {
        ErrorLog errorLog = new ErrorLog();
        errorLog.setLogId(String.valueOf(System.currentTimeMillis()));
        errorLog.setType("alert");
        errorLog.setMessage(message);
        errorLog.setStack(detail);
        errorLog.setTimestamp(LocalDateTime.now());

        try {
            errorLogMapper.insert(errorLog);
            log.warn("[ALERT] {}: {}", type, message);
        } catch (Exception e) {
            log.error("Failed to log alert", e);
        }
    }
}

package com.library.service;

import com.library.entity.AuditLog;
import com.library.mapper.AuditLogMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogMapper auditLogMapper;

    public AuditService(AuditLogMapper auditLogMapper) {
        this.auditLogMapper = auditLogMapper;
    }

    public void log(String action, String target, String detail) {
        log(action, null, target, detail);
    }

    /**
     * 记录审计日志，使用独立的事务
     * 即使主事务失败，审计日志也能被保存
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, Integer userId, String target, String detail) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setUserId(userId);
        auditLog.setTarget(target);
        auditLog.setDetail(detail);
        try {
            auditLogMapper.insert(auditLog);
        } catch (Exception e) {
            log.error("审计日志写入失败: action={}, target={}", action, target, e);
        }
    }
}
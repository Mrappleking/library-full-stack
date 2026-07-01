package com.library.service;

import com.library.entity.*;
import com.library.exception.AppException;
import com.library.mapper.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class FineService {

    private final FineMapper fineMapper;
    private final UserMapper userMapper;

    public FineService(FineMapper fineMapper, UserMapper userMapper) {
        this.fineMapper = fineMapper;
        this.userMapper = userMapper;
    }

    public List<Fine> findAll(String type, Boolean paid) {
        return fineMapper.findAll(type, paid);
    }

    public List<Fine> findByUserId(Integer userId) {
        return fineMapper.findByUserId(userId);
    }

    /**
     * Calculate overdue fine amount.
     * Per-day rate from the circulation rule.
     */
    public BigDecimal calcOverdueFine(LocalDateTime dueDate, LocalDateTime now, BigDecimal finePerDay) {
        long daysOverdue = ChronoUnit.DAYS.between(dueDate, now);
        if (daysOverdue <= 0) return BigDecimal.ZERO;
        return finePerDay.multiply(BigDecimal.valueOf(daysOverdue));
    }

    @Transactional
    public Fine createFine(Integer borrowRecordId, Integer userId, BigDecimal amount, String type) {
        Fine fine = new Fine();
        fine.setBorrowRecordId(borrowRecordId);
        fine.setUserId(userId);
        fine.setAmount(amount);
        fine.setType(type);
        fine.setPaid(false);
        fineMapper.insert(fine);

        // Update user total fines
        userMapper.addFine(userId, amount);
        return fine;
    }

    @Transactional
    public Fine markPaid(Integer fineId, Integer userId, String userRole) {
        Fine fine = fineMapper.findById(fineId);
        if (fine == null) throw AppException.notFound("罚款记录不存在");
        if (fine.getPaid()) throw AppException.badRequest("该罚款已支付");

        // Admins can pay any fine; readers can only pay their own
        if (!"admin".equals(userRole) && !fine.getUserId().equals(userId)) {
            throw AppException.forbidden("无权操作该罚款记录");
        }

        // Deduct from user's total_fines
        userMapper.addFine(fine.getUserId(), fine.getAmount().negate());
        fineMapper.markPaid(fineId, LocalDateTime.now());
        return fineMapper.findById(fineId);
    }
}

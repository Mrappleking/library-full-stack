package com.library.service;

import com.library.entity.BorrowRecord;
import com.library.entity.CirculationRule;
import com.library.entity.User;
import com.library.entity.BookItem;
import com.library.mapper.BorrowRecordMapper;
import com.library.mapper.FineMapper;
import com.library.mapper.UserMapper;
import com.library.mapper.BookItemMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
public class OverdueFineScheduler {

    private static final Logger log = LoggerFactory.getLogger(OverdueFineScheduler.class);

    private final BorrowRecordMapper borrowRecordMapper;
    private final FineMapper fineMapper;
    private final FineService fineService;
    private final RuleService ruleService;
    private final UserMapper userMapper;
    private final BookItemMapper bookItemMapper;

    public OverdueFineScheduler(BorrowRecordMapper borrowRecordMapper,
                                FineMapper fineMapper,
                                FineService fineService,
                                RuleService ruleService,
                                UserMapper userMapper,
                                BookItemMapper bookItemMapper) {
        this.borrowRecordMapper = borrowRecordMapper;
        this.fineMapper = fineMapper;
        this.fineService = fineService;
        this.ruleService = ruleService;
        this.userMapper = userMapper;
        this.bookItemMapper = bookItemMapper;
    }

    /**
     * Runs daily at 2:00 AM to auto-create fines for overdue borrows.
     * Idempotent: skips borrow records that already have a fine.
     * Note: Transaction handled per-record in fineService.createFine()
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void autoFineOverdueBorrows() {
        log.info("Starting overdue fine auto-creation task");
        List<BorrowRecord> overdueRecords = borrowRecordMapper.findOverdueBorrows();
        int created = 0;
        int skipped = 0;

        for (BorrowRecord record : overdueRecords) {
            try {
                // Idempotency check: skip if a fine already exists for this borrow
                Integer existingFineId = fineMapper.findByBorrowRecordId(record.getId());
                if (existingFineId != null) {
                    skipped++;
                    continue;
                }

                LocalDateTime now = LocalDateTime.now();
                long daysOverdue = ChronoUnit.DAYS.between(record.getDueDate(), now);
                if (daysOverdue <= 0) {
                    skipped++;
                    continue;
                }

                // Get user and book item to determine correct circulation rule
                User user = userMapper.findById(record.getUserId());
                BookItem bookItem = record.getBookItemId() != null ? bookItemMapper.findById(record.getBookItemId()) : null;
                
                if (user == null) {
                    log.warn("User not found for record {}, skipping fine creation", record.getId());
                    skipped++;
                    continue;
                }
                
                Integer patronCategoryId = user.getPatronCategoryId();
                Integer itemTypeId = bookItem != null ? bookItem.getItemTypeId() : null;

                CirculationRule rule = ruleService.getRule(patronCategoryId, itemTypeId);
                if (rule == null) {
                    log.warn("No circulation rule found for record {}, skipping fine creation", record.getId());
                    skipped++;
                    continue;
                }
                
                BigDecimal fineAmount = rule.getFinePerDay().multiply(BigDecimal.valueOf(daysOverdue));

                fineService.createFine(record.getId(), record.getUserId(), fineAmount, "overdue");
                created++;
            } catch (Exception e) {
                log.error("Failed to auto-create fine for borrowRecordId={}", record.getId(), e);
            }
        }

        if (created > 0 || skipped > 0) {
            log.info("Overdue fine task complete: created={}, skipped={}, total={}", created, skipped, overdueRecords.size());
        }
    }
}

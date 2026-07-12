package com.library.service;

import com.library.dto.request.BorrowRequest;
import com.library.entity.*;
import com.library.exception.AppException;
import com.library.mapper.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import jakarta.servlet.http.HttpServletResponse;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class BorrowService {

    private static final Logger logger = LoggerFactory.getLogger(BorrowService.class);

    private final BorrowRecordMapper borrowRecordMapper;
    private final BookMapper bookMapper;
    private final BookItemMapper bookItemMapper;
    private final UserMapper userMapper;
    private final AuditService auditService;
    private final RuleService ruleService;
    private final FineService fineService;
    private final HoldService holdService;
    private final BookService bookService;
    private final HoldMapper holdMapper;

    public BorrowService(BorrowRecordMapper borrowRecordMapper, BookMapper bookMapper,
                          BookItemMapper bookItemMapper, UserMapper userMapper,
                          AuditService auditService,
                          RuleService ruleService, FineService fineService,
                          HoldService holdService, BookService bookService, HoldMapper holdMapper) {
        this.borrowRecordMapper = borrowRecordMapper;
        this.bookMapper = bookMapper;
        this.bookItemMapper = bookItemMapper;
        this.userMapper = userMapper;
        this.auditService = auditService;
        this.ruleService = ruleService;
        this.fineService = fineService;
        this.holdService = holdService;
        this.bookService = bookService;
        this.holdMapper = holdMapper;
    }

    public Map<String, Object> getMyBorrows(Integer userId, int page, int limit) {
        int offset = (page - 1) * limit;
        List<BorrowRecord> records = borrowRecordMapper.findByUserIdPage(userId, offset, limit);
        long total = borrowRecordMapper.countByUserId(userId);

        Map<String, Object> result = new HashMap<>();
        result.put("borrows", records);
        result.put("total", total);
        return result;
    }

    public Map<String, Object> listBorrows(int page, int limit, String search, String status) {
        int offset = (page - 1) * limit;
        List<BorrowRecord> records = borrowRecordMapper.findAllPage(offset, limit, search, status);
        long total = borrowRecordMapper.countAll(search, status);

        Map<String, Object> result = new HashMap<>();
        result.put("borrows", records);
        result.put("total", total);
        return result;
    }

    /**
     * Borrow a book — uses synchronized transactional approach.
     * Equivalent to the Prisma interactive $transaction in the original TS.
     */
    @Transactional
    public BorrowRecord borrow(Integer userId, BorrowRequest params) {
        Integer bookId = params.getBookId();
        Integer bookItemId = params.getBookItemId();

        if (bookId == null && bookItemId == null) {
            throw AppException.badRequest("bookId或bookItemId不能为空");
        }

        Integer targetBookId = bookId;
        Integer targetItemId = bookItemId;

        // Find the item if only bookId was given
        if (targetItemId != null) {
            BookItem item = bookItemMapper.findById(targetItemId);
            if (item == null) throw AppException.notFound("馆藏复本不存在");
            if (!"available".equals(item.getStatus())) {
                throw AppException.badRequest("该复本不可借");
            }
            targetBookId = item.getBookId();
        } else {
            Book book = bookMapper.findById(targetBookId);
            if (book == null) throw AppException.notFound("图书不存在");
            BookItem firstItem = bookItemMapper.findFirstAvailableByBookId(targetBookId);
            if (firstItem != null) targetItemId = firstItem.getId();
        }

        if (targetBookId == null) throw AppException.notFound("图书不存在");

        User user = userMapper.findById(userId);
        BookItem item = targetItemId != null ? bookItemMapper.findById(targetItemId) : null;
        Integer patronCatId = user != null ? user.getPatronCategoryId() : null;
        Integer itemTypeId = item != null ? item.getItemTypeId() : null;

        CirculationRule rule = ruleService.getRule(patronCatId, itemTypeId);
        LocalDateTime dueDate = LocalDateTime.now().plusDays(rule.getLoanDays());

        // Transaction-level checks: re-verify availability atomically
        BorrowRecord existing = borrowRecordMapper.findActiveByUserAndBook(userId, targetBookId);
        if (existing != null) {
            throw AppException.badRequest("您已借阅过此书");
        }

        long currentCount = borrowRecordMapper.countActiveByUserId(userId);
        if (currentCount >= rule.getMaxBorrows()) {
            throw AppException.badRequest("借阅数量已达上限: " + rule.getMaxBorrows());
        }

        // Re-verify item is still available with FOR UPDATE lock
        if (targetItemId != null) {
            BookItem itemCheck = bookItemMapper.findByIdForUpdate(targetItemId);
            if (itemCheck == null || !"available".equals(itemCheck.getStatus())) {
                throw AppException.badRequest("复本已不可用");
            }
            bookService.validateItemStatus("available", "borrowed");
        }

        // All checks passed — create borrow record
        BorrowRecord record = new BorrowRecord();
        record.setUserId(userId);
        record.setBookId(targetBookId);
        record.setBookItemId(targetItemId);
        record.setBorrowDate(LocalDateTime.now());
        record.setDueDate(dueDate);
        record.setStatus("active");
        record.setRenewed(false);
        borrowRecordMapper.insert(record);

        // Update book inventory
        int updated = bookMapper.decrementAvailable(targetBookId);
        if (updated == 0) throw AppException.badRequest("该书已无可用副本");
        if (targetBookId != null) {
            bookMapper.updateStatus(targetBookId, "borrowed");
        }

        if (targetItemId != null) {
            bookItemMapper.updateStatus(targetItemId, "borrowed");
        }

        auditService.log("borrow", userId, "book:" + targetBookId, targetItemId != null ? "item:" + targetItemId : null);
        return borrowRecordMapper.findById(record.getId());
    }

    @Transactional
    public BorrowRecord returnBook(Integer borrowRecordId, Integer userId, boolean isAdmin) {
        BorrowRecord record = borrowRecordMapper.findById(borrowRecordId);
        if (record == null) throw AppException.notFound("借阅记录不存在");
        if (!"active".equals(record.getStatus())) {
            throw AppException.badRequest("已归还");
        }
        if (!record.getUserId().equals(userId) && !isAdmin) {
            throw AppException.forbidden("无权操作");
        }

        LocalDateTime now = LocalDateTime.now();
        boolean isOverdue = now.isAfter(record.getDueDate());

        CirculationRule rule = ruleService.getRule(
                record.getUser() != null ? record.getUser().getPatronCategoryId() : null,
                record.getBookItem() != null ? record.getBookItem().getItemTypeId() : null
        );

        if (isOverdue) {
            BigDecimal fineAmount = fineService.calcOverdueFine(record.getDueDate(), now, rule.getFinePerDay());
            if (fineAmount.compareTo(BigDecimal.ZERO) > 0) {
                fineService.createFine(borrowRecordId, record.getUserId(), fineAmount, "overdue");
            }
        }

        // Check for next hold in queue
        Hold nextHold = holdService.getNextPendingHold(record.getBookId());

        // Update borrow record
        borrowRecordMapper.returnBook(borrowRecordId, now, isOverdue ? "overdue" : "returned");

        if (nextHold != null && record.getBookItemId() != null) {
            // Hold promotion: item goes to on_hold
            Hold hold = holdMapper.findById(nextHold.getId());
            if (hold != null) {
                hold.updateToReady(record.getBookItemId(), now.plusDays(3));
                holdMapper.updateToReady(hold.getId(), hold.getBookItemId(), hold.getExpiryDate());
            }
            bookItemMapper.updateStatus(record.getBookItemId(), "on_hold");
            // available stays the same
        } else {
            // Normal return: increment available
            bookMapper.incrementAvailable(record.getBookId());
            if (record.getBookItemId() != null) {
                bookItemMapper.updateStatus(record.getBookItemId(), "available");
            }
        }

        auditService.log("return", userId, "record:" + borrowRecordId, isOverdue ? "overdue" : null);
        return borrowRecordMapper.findById(borrowRecordId);
    }

    @Transactional
    public Map<String, Object> renew(Integer recordId, Integer userId) {
        BorrowRecord record = borrowRecordMapper.findById(recordId);
        if (record == null) throw AppException.notFound("借阅记录不存在");
        if (!"active".equals(record.getStatus())) throw AppException.badRequest("无法续借");
        if (!record.getUserId().equals(userId)) throw AppException.forbidden("无权操作");

        CirculationRule rule = ruleService.getRule(
                record.getUser() != null ? record.getUser().getPatronCategoryId() : null,
                record.getBookItem() != null ? record.getBookItem().getItemTypeId() : null
        );

        if (record.getRenewed()) {
            throw AppException.badRequest("已达续借上限: " + rule.getRenewals() + "次");
        }

        LocalDateTime newDue = record.getDueDate().plusDays(rule.getRenewalDays());
        borrowRecordMapper.renew(recordId, newDue);

        auditService.log("renew", userId, "record:" + recordId, rule.getRenewalDays() + "d");

        Map<String, Object> result = new HashMap<>();
        result.put("id", recordId);
        result.put("dueDate", newDue);
        result.put("renewed", true);
        result.put("renewedDays", rule.getRenewalDays());
        return result;
    }

    public Map<String, Object> getHistory(Integer userId, int page, int limit) {
        int offset = (page - 1) * limit;
        List<BorrowRecord> records = borrowRecordMapper.findByUserIdPage(userId, offset, limit);
        long total = borrowRecordMapper.countByUserId(userId);

        Map<String, Object> result = new HashMap<>();
        result.put("borrows", records);
        result.put("total", total);
        return result;
    }

    /**
     * Export borrow records as CSV stream.
     * @param userId  null for admin (all records), non-null for reader
     */
    public void exportCsv(Integer userId, HttpServletResponse response) {
        List<Map<String, Object>> records;
        String filename;

        if (userId == null) {
            records = borrowRecordMapper.findAllForExport();
            filename = "borrows-all.csv";
        } else {
            records = borrowRecordMapper.findByUserIdForExport(userId);
            filename = "borrows-my.csv";
        }

        response.setContentType("text/csv; charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");

        try (PrintWriter writer = new PrintWriter(
                new OutputStreamWriter(response.getOutputStream(), StandardCharsets.UTF_8))) {
            // BOM for Excel UTF-8 compatibility
            writer.write('\uFEFF');
            // Header
            writer.println("书名,借阅日期,应还日期,实际归还日期,罚款金额");

            // Data rows
            for (Map<String, Object> row : records) {
                writer.print(escapeCsv(row.get("bookTitle")));
                writer.print(',');
                writer.print(escapeCsv(row.get("borrowDate")));
                writer.print(',');
                writer.print(escapeCsv(row.get("dueDate")));
                writer.print(',');
                writer.print(escapeCsv(row.get("returnDate")));
                writer.print(',');
                writer.print(row.get("fineAmount"));
                writer.println();
            }
        } catch (Exception e) {
            throw new RuntimeException("CSV export failed", e);
        }
    }

    private String escapeCsv(Object val) {
        if (val == null) return "";
        String s = val.toString();
        if (s.contains(",") || s.contains("\"") || s.contains("\n")) {
            return "\"" + s.replace("\"", "\"\"") + "\"";
        }
        return s;
    }
}

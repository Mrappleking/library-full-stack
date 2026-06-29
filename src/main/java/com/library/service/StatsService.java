package com.library.service;

import com.library.dto.response.StatsOverviewResponse;
import com.library.mapper.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class StatsService {

    private final BookMapper bookMapper;
    private final UserMapper userMapper;
    private final BorrowRecordMapper borrowRecordMapper;
    private final CategoryMapper categoryMapper;

    public StatsService(BookMapper bookMapper, UserMapper userMapper,
                        BorrowRecordMapper borrowRecordMapper, CategoryMapper categoryMapper) {
        this.bookMapper = bookMapper;
        this.userMapper = userMapper;
        this.borrowRecordMapper = borrowRecordMapper;
        this.categoryMapper = categoryMapper;
    }

    public StatsOverviewResponse getOverview() {
        StatsOverviewResponse stats = new StatsOverviewResponse();
        stats.setTotalBooks(bookMapper.count());
        stats.setTotalReaders(userMapper.countReaders());
        stats.setTotalCategories(categoryMapper.findAll().size());
        stats.setActiveBorrows((int) borrowRecordMapper.countActive());
        stats.setOverdueCount((int) borrowRecordMapper.countOverdue());
        return stats;
    }

    public List<Map<String, Object>> getPopular() {
        List<Map<String, Object>> raw = borrowRecordMapper.popularBooks();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> row : raw) {
            Map<String, Object> enriched = new HashMap<>(row);
            // Transform borrowCount to _count.borrowRecords
            Object bc = enriched.remove("borrowCount");
            enriched.put("_count", Map.of("borrowRecords", bc != null ? bc : 0));
            // Enrich with category name
            Object catId = enriched.get("categoryId");
            if (catId instanceof Number) {
                var cat = categoryMapper.findById(((Number) catId).intValue());
                enriched.put("category", cat != null ? Map.of("id", cat.getId(), "name", cat.getName()) : null);
            }
            enriched.remove("categoryId");
            result.add(enriched);
        }
        return result;
    }

    public List<Map<String, Object>> getMonthly() {
        LocalDateTime since = LocalDateTime.now().minusMonths(12);
        return borrowRecordMapper.monthlyStats(since);
    }

    public Map<String, Object> getFacets(Map<String, Object> params) {
        return Map.of("facets", Map.of());
    }
}

package com.library.service;

import com.library.dto.response.BookDetailResponse;
import com.library.dto.response.BookItemResponse;
import com.library.dto.response.CategoryResponse;
import com.library.entity.Book;
import com.library.entity.BookItem;
import com.library.entity.BorrowRecord;
import com.library.exception.AppException;
import com.library.mapper.*;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookService {

    private static final Logger log = LoggerFactory.getLogger(BookService.class);

    private final BookMapper bookMapper;
    private final BookItemMapper bookItemMapper;
    private final CategoryMapper categoryMapper;
    private final BorrowRecordMapper borrowRecordMapper;
    private final AuditService auditService;
    private final CacheService cacheService;
    
    private static final String BOOK_CACHE_PREFIX = "book:";
    private static final int BOOK_CACHE_TTL_SECONDS = 300;
    
    // Status transition validation
    private static final Map<String, List<String>> STATUS_TRANSITIONS = new HashMap<>();
    static {
        STATUS_TRANSITIONS.put("available", Arrays.asList("borrowed", "on_hold", "repairing", "lost", "withdrawn"));
        STATUS_TRANSITIONS.put("borrowed", Arrays.asList("available", "lost", "on_hold"));
        STATUS_TRANSITIONS.put("on_hold", Arrays.asList("available", "borrowed", "expired"));
        STATUS_TRANSITIONS.put("repairing", Arrays.asList("available", "lost", "withdrawn"));
        STATUS_TRANSITIONS.put("lost", Arrays.asList("available", "withdrawn"));
        STATUS_TRANSITIONS.put("withdrawn", Collections.emptyList());
    }

    public BookService(BookMapper bookMapper, BookItemMapper bookItemMapper, CategoryMapper categoryMapper, BorrowRecordMapper borrowRecordMapper, AuditService auditService, CacheService cacheService) {
        this.bookMapper = bookMapper;
        this.bookItemMapper = bookItemMapper;
        this.categoryMapper = categoryMapper;
        this.borrowRecordMapper = borrowRecordMapper;
        this.auditService = auditService;
        this.cacheService = cacheService;
    }
    
    public Map<String, Object> list(com.library.dto.request.BookListRequest params) {
        int page = Math.max(1, params.getPage() != null ? params.getPage() : 1);
        int limit = Math.min(50, Math.max(1, params.getLimit() != null ? params.getLimit() : 20));

        Map<String, Object> queryParams = new HashMap<>();
        queryParams.put("offset", (page - 1) * limit);
        queryParams.put("page", page);
        queryParams.put("limit", limit);
        queryParams.put("search", params.getSearch());
        queryParams.put("categoryId", params.getCategoryId());
        queryParams.put("language", params.getLanguage());
        queryParams.put("yearMin", params.getYearMin());
        queryParams.put("yearMax", params.getYearMax());
        queryParams.put("campus", params.getCampus());
        queryParams.put("location", params.getLocation());
        queryParams.put("sortBy", params.getSortBy());
        queryParams.put("sortOrder", params.getSortOrder());

        List<Book> books = bookMapper.searchBooks(queryParams);
        long total = bookMapper.countBooks(queryParams);
        int pages = (int) Math.ceil((double) total / limit);

        Map<String, Object> result = new HashMap<>();
        result.put("books", books);
        result.put("total", total);
        result.put("page", page);
        result.put("limit", limit);
        result.put("pages", pages);
        return result;
    }

    public BookDetailResponse getById(Integer id) {
        String cacheKey = BOOK_CACHE_PREFIX + id;
        BookDetailResponse cached = cacheService.get(cacheKey);
        if (cached != null) {
            return cached;
        }

        Book book = bookMapper.findById(id);
        if (book == null) throw AppException.notFound("图书不存在");

        BookDetailResponse resp = new BookDetailResponse();
        resp.setId(book.getId());
        resp.setIsbn(book.getIsbn());
        resp.setTitle(book.getTitle());
        resp.setAuthor(book.getAuthor());
        resp.setPublisher(book.getPublisher());
        resp.setYear(book.getYear());
        resp.setTotal(book.getTotal());
        resp.setAvailable(book.getAvailable());
        resp.setStatus(book.getStatus());
        resp.setLocation(book.getLocation());
        resp.setCover(book.getCover());
        resp.setDesc(book.getDesc());
        resp.setClcNumber(book.getClcNumber());
        resp.setPhysicalDesc(book.getPhysicalDesc());
        resp.setLanguage(book.getLanguage());
        resp.setCountry(book.getCountry());
        resp.setCategoryId(book.getCategoryId());
        resp.setCreatedAt(book.getCreatedAt());
        resp.setUpdatedAt(book.getUpdatedAt());

        if (book.getCategory() != null) {
            int bookCount = (int) categoryMapper.countBooksByCategory(book.getCategory().getId());
            resp.setCategory(new CategoryResponse(book.getCategory().getId(), book.getCategory().getName(),
                    book.getCategory().getDesc(), bookCount));
        }

        List<BookItem> items = bookItemMapper.findByBookId(id);
        List<BookItemResponse> itemResponses = items.stream().map(this::toBookItemResponse).collect(Collectors.toList());
        resp.setItems(itemResponses);
        resp.setItemsCount((int) bookItemMapper.countByBookId(id));

        cacheService.set(cacheKey, resp, BOOK_CACHE_TTL_SECONDS, java.util.concurrent.TimeUnit.SECONDS);
        return resp;
    }

    public List<BookItemResponse> getItemsByBookId(Integer id) {
        Book book = bookMapper.findById(id);
        if (book == null) throw AppException.notFound("图书不存在");

        List<BookItem> items = bookItemMapper.findByBookId(id);
        return items.stream().map(this::toBookItemResponse).collect(Collectors.toList());
    }

    private BookItemResponse toBookItemResponse(BookItem item) {
        BookItemResponse ir = new BookItemResponse();
        ir.setId(item.getId());
        ir.setBarcode(item.getBarcode());
        ir.setCallNumber(item.getCallNumber());
        ir.setLocation(item.getLocation());
        ir.setCampus(item.getCampus());
        ir.setCondition(item.getCondition());
        ir.setStatus(item.getStatus());
        ir.setPrice(item.getPrice() != null ? item.getPrice().doubleValue() : null);
        ir.setAcquiredAt(item.getAcquiredAt());
        ir.setRequests(item.getRequests());
        ir.setBookId(item.getBookId());
        ir.setItemTypeId(item.getItemTypeId());
        ir.setCreatedAt(item.getCreatedAt());
        ir.setUpdatedAt(item.getUpdatedAt());
        return ir;
    }

    @Transactional
    public Book create(com.library.dto.request.BookCreateRequest data) {
        Book book = new Book();
        book.setIsbn(data.getIsbn());
        book.setTitle(data.getTitle());
        book.setAuthor(data.getAuthor());
        book.setPublisher(data.getPublisher());
        book.setYear(data.getYear());
        int total = data.getTotal() != null ? data.getTotal() : 1;
        book.setTotal(total);
        book.setAvailable(total);
        book.setStatus("available");
        book.setLocation(data.getLocation());
        book.setCover(data.getCover());
        book.setDesc(data.getDesc());
        book.setClcNumber(data.getClcNumber());
        book.setPhysicalDesc(data.getPhysicalDesc());
        book.setLanguage(data.getLanguage());
        book.setCountry(data.getCountry());
        book.setCategoryId(data.getCategoryId());
        bookMapper.insert(book);
        auditService.log("create", null, "book:" + book.getId(), "Created book: " + book.getTitle());
        cacheService.deletePattern(BOOK_CACHE_PREFIX + "*");
        return book;
    }

    @Transactional
    public Book update(Integer id, com.library.dto.request.BookUpdateRequest data) {
        Book current = bookMapper.findById(id);
        if (current == null) throw AppException.notFound("图书不存在");

        if (data.getTotal() != null) {
            int newTotal = data.getTotal();
            int borrowed = current.getTotal() - current.getAvailable();
            if (newTotal < borrowed) {
                throw AppException.badRequest("总数不能低于 " + borrowed);
            }
            int diff = newTotal - current.getTotal();
            int newAvailable = current.getAvailable() + diff;
            bookMapper.updateTotalAndAvailable(id, newTotal, newAvailable);
        }

        Book updateBook = new Book();
        updateBook.setId(id);
        if (data.getTitle() != null) updateBook.setTitle(data.getTitle());
        if (data.getAuthor() != null) updateBook.setAuthor(data.getAuthor());
        if (data.getIsbn() != null) updateBook.setIsbn(data.getIsbn());
        if (data.getPublisher() != null) updateBook.setPublisher(data.getPublisher());
        if (data.getLocation() != null) updateBook.setLocation(data.getLocation());
        if (data.getCover() != null) {
            updateBook.setCover(data.getCover());
            removeOldCoverIfChanged(current.getCover(), data.getCover());
        }
        if (data.getDesc() != null) updateBook.setDesc(data.getDesc());
        if (data.getClcNumber() != null) updateBook.setClcNumber(data.getClcNumber());
        if (data.getPhysicalDesc() != null) updateBook.setPhysicalDesc(data.getPhysicalDesc());
        if (data.getLanguage() != null) updateBook.setLanguage(data.getLanguage());
        if (data.getCountry() != null) updateBook.setCountry(data.getCountry());
        if (data.getCategoryId() != null) updateBook.setCategoryId(data.getCategoryId());

        bookMapper.update(updateBook);

        Book updated = bookMapper.findById(id);
        auditService.log("update", null, "book:" + id, "Updated book: " + (updated != null ? updated.getTitle() : id));
        cacheService.delete(BOOK_CACHE_PREFIX + id);
        return updated;
    }

    @Transactional
    public void remove(Integer id) {
        long count = bookItemMapper.countByBookId(id);
        if (count > 0) throw AppException.badRequest("无法删除，该书有 " + count + " 个馆藏复本");
        bookMapper.deleteById(id);
        auditService.log("delete", null, "book:" + id, "Deleted book id: " + id);
        cacheService.delete(BOOK_CACHE_PREFIX + id);
    }

    public Map<String, Object> getFacets(Map<String, Object> params) {
        Map<String, Object> facets = new HashMap<>();

        // campus facet — from book_items JOIN books
        facets.put("campus", bookItemMapper.countByCampus(params));

        // location facet — from book_items JOIN books
        facets.put("location", bookItemMapper.countByLocation(params));

        // language facet — from books
        facets.put("language", bookMapper.countByLanguage(params));

        // subject (category) facet — from books JOIN categories
        facets.put("subject", bookMapper.countByCategory(params));

        // yearRange facet — decade grouping
        facets.put("yearRange", bookMapper.countByYearDecade(params));

        return Map.of("facets", facets);
    }

    public void validateItemStatus(String current, String next) {
        List<String> allowed = STATUS_TRANSITIONS.get(current);
        if (allowed == null || !allowed.contains(next)) {
            throw AppException.badRequest("无效的状态转换: " + current + " → " + next);
        }
    }

    public Map<String, Object> lookupByBarcode(String barcode) {
        BookItem item = bookItemMapper.findByBarcode(barcode);
        if (item == null) return null;
        Map<String, Object> result = new HashMap<>();
        result.put("item", item);
        // Load active borrow for circulation display
        BorrowRecord activeBorrow = borrowRecordMapper.findActiveByBookItemId(item.getId());
        if (activeBorrow != null) {
            result.put("currentBorrow", activeBorrow);
        }
        return result;
    }

     private void removeOldCoverIfChanged(String oldCover,String newCover){
        if(oldCover!=null&&oldCover.startsWith("/covers/")&&!oldCover.equals(newCover)){
            try{
                Path oldFile =Paths.get("src/main/resources/static"+oldCover);
                Files.deleteIfExists(oldFile);
                log.info("Deleted old cover:{}",oldCover);
            } catch (IOException e) {
                log.warn("Failed to delete old cover:{}", oldCover, e);
            }
        }
    }
}

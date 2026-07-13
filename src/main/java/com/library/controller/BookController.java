package com.library.controller;

import com.library.dto.request.BookCreateRequest;
import com.library.dto.request.BookUpdateRequest;
import com.library.dto.request.BookListRequest;
import com.library.dto.response.ApiResponse;
import com.library.dto.response.BookDetailResponse;
import com.library.entity.Book;
import com.library.service.BookService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;

    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String campus,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) Integer yearMin,
            @RequestParam(required = false) Integer yearMax,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortOrder) {
        BookListRequest params = new BookListRequest();
        params.setPage(page);
        params.setLimit(limit);
        params.setSearch(search);
        params.setCategoryId(categoryId);
        params.setCampus(campus);
        params.setLanguage(language);
        params.setYearMin(yearMin);
        params.setYearMax(yearMax);
        params.setLocation(location);
        params.setSortBy(sortBy);
        params.setSortOrder(sortOrder);
        return ResponseEntity.ok(ApiResponse.success(bookService.list(params)));
    }

    @GetMapping("/facets")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFacets(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer categoryId) {
        Map<String, Object> params = new HashMap<>();
        if (search != null) params.put("search", search);
        if (categoryId != null) params.put("categoryId", categoryId);
        return ResponseEntity.ok(ApiResponse.success(bookService.getFacets(params)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookDetailResponse>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(bookService.getById(id)));
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<ApiResponse<Object>> getItems(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(bookService.getItemsByBookId(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Book>> create(@Valid @RequestBody BookCreateRequest data) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("图书创建成功", bookService.create(data)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> update(@PathVariable Integer id, @Valid @RequestBody BookUpdateRequest data) {
        return ResponseEntity.ok(ApiResponse.success("图书更新成功", bookService.update(id, data)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        bookService.remove(id);
        return ResponseEntity.ok(ApiResponse.success("图书删除成功", null));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<ApiResponse<com.library.entity.BookItem>> addCopy(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> body) {
        String barcode = (String) body.get("barcode");
        String callNumber = (String) body.get("callNumber");
        String location = (String) body.get("location");
        java.math.BigDecimal price = body.get("price") != null ? 
            new java.math.BigDecimal(body.get("price").toString()) : null;
        
        com.library.entity.BookItem item = bookService.addCopy(id, barcode, callNumber, location, price);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("复本添加成功", item));
    }
}